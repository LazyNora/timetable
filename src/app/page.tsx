"use client";

import { useState, useCallback, useEffect } from "react";
import FileUpload from "@/components/FileUpload";
import ClassSearch from "@/components/ClassSearch";
import Timetable from "@/components/Timetable";
import WeekNavigation from "@/components/WeekNavigation";
import Filters from "@/components/Filters";
import SelectedClassesSummary from "@/components/SelectedClassesSummary";
import { parseCSV } from "@/utils/csvParser";
import { Class, ParsedData, Filters as FiltersType } from "@/types/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";

export default function Home() {
	const [parsedData, setParsedData] = useState<ParsedData | null>(null);
	const [selectedClasses, setSelectedClasses] = useState<Class[]>([]);
	const [currentWeek, setCurrentWeek] = useState(1);
	const [filters, setFilters] = useState<FiltersType>({
		subject: [],
		instructor: [],
		timeSlot: "all",
		dayOfWeek: null,
	});
	const [startDate, setStartDate] = useState<Date>(new Date());
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const savedClasses = localStorage.getItem("selectedClasses");
		if (savedClasses) {
			const parsedClasses = JSON.parse(savedClasses);
			setSelectedClasses(parsedClasses);

			// Set the start date based on the earliest class start date
			const earliestDate = parsedClasses.reduce((earliest: Date, c: Class) => {
				const classStart = new Date(c.schedules[0].startDate.split("/").reverse().join("-"));
				return classStart < earliest ? classStart : earliest;
			}, new Date("9999-12-31"));

			const mondayOfWeek = new Date(earliestDate);
			mondayOfWeek.setDate(earliestDate.getDate() - (earliestDate.getDay() - 1));
			setStartDate(mondayOfWeek);
		}
	}, []);

	const handleFileUpload = useCallback(async (file: File) => {
		setIsLoading(true);
		try {
			const content = await file.text();
			const parsed = await new Promise<ParsedData>((resolve) => {
				setTimeout(() => {
					resolve(parseCSV(content));
				}, 0);
			});
			setParsedData(parsed);

			const earliestDate = parsed.classes.reduce((earliest, c) => {
				const classStart = new Date(c.schedules[0].startDate.split("/").reverse().join("-"));
				return classStart < earliest ? classStart : earliest;
			}, new Date("9999-12-31"));

			const mondayOfWeek = new Date(earliestDate);
			mondayOfWeek.setDate(earliestDate.getDate() - (earliestDate.getDay() - 1));
			setStartDate(mondayOfWeek);
		} catch (error) {
			console.error("Error parsing CSV:", error);
			alert("An error occurred while parsing the CSV file. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}, []);

	const handleAddClass = useCallback((newClass: Class) => {
		setSelectedClasses((prev) => {
			const updated = [...prev, newClass];
			localStorage.setItem("selectedClasses", JSON.stringify(updated));
			return updated;
		});
	}, []);

	const handleRemoveClass = useCallback((classId: string) => {
		setSelectedClasses((prev) => {
			const updated = prev.filter((c) => c.id !== classId);
			localStorage.setItem("selectedClasses", JSON.stringify(updated));
			return updated;
		});
	}, []);

	const handleResetFilters = useCallback(() => {
		setFilters({
			subject: [],
			instructor: [],
			timeSlot: "all",
			dayOfWeek: null,
		});
	}, []);

	const handleSaveClasses = useCallback(() => {
		localStorage.setItem("selectedClasses", JSON.stringify(selectedClasses));
		alert("Classes saved successfully!");
	}, [selectedClasses]);

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-4xl font-bold mb-4 text-center">Class Schedule App</h1>
			<FileUpload onFileUpload={handleFileUpload} />
			{isLoading && <LoadingSpinner />}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div className="lg:col-span-1">
					{parsedData && (
						<>
							<Filters
								filters={filters}
								onFilterChange={setFilters}
								onResetFilters={handleResetFilters}
								subjects={Array.from(new Set(parsedData.classes.map((c) => c.name)))}
								instructors={Array.from(new Set(parsedData.classes.map((c) => c.instructor)))}
							/>
							<ClassSearch
								classes={parsedData.classes}
								onAddClass={handleAddClass}
								onRemoveClass={handleRemoveClass}
								selectedClasses={selectedClasses}
								filters={filters}
								isLoading={isLoading}
							/>
						</>
					)}
				</div>
				<div className="lg:col-span-2">
					{(parsedData || selectedClasses.length > 0) && (
						<>
							<WeekNavigation
								currentWeek={currentWeek}
								onWeekChange={setCurrentWeek}
								totalWeeks={32}
								startDate={startDate}
							/>
							<Timetable
								classes={selectedClasses}
								currentWeek={currentWeek}
								startDate={startDate}
							/>
						</>
					)}
					{selectedClasses.length > 0 && (
						<>
							<SelectedClassesSummary
								selectedClasses={selectedClasses}
								onRemoveClass={handleRemoveClass}
							/>
							<Button onClick={handleSaveClasses} className="mb-4">
								Save Selected Classes
							</Button>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
