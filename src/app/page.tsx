"use client";

import { useState, useCallback } from "react";
import FileUpload from "@/components/FileUpload";
import ClassSearch from "@/components/ClassSearch";
import Timetable from "@/components/Timetable";
import WeekNavigation from "@/components/WeekNavigation";
import Filters from "@/components/Filters";
import { parseCSV } from "@/utils/csvParser";
import { Class, ParsedData, Filters as FiltersType } from "@/types/types";
import LoadingSpinner from "@/components/LoadingSpinner";

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
		setSelectedClasses((prev) => [...prev, newClass]);
	}, []);

	const handleRemoveClass = useCallback((classId: string) => {
		setSelectedClasses((prev) => prev.filter((c) => c.id !== classId));
	}, []);

	const handleResetFilters = useCallback(() => {
		setFilters({
			subject: [],
			instructor: [],
			timeSlot: "all",
			dayOfWeek: null,
		});
	}, []);

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-4xl font-bold mb-4 text-center">Class Schedule App</h1>
			<FileUpload onFileUpload={handleFileUpload} />
			{isLoading && <LoadingSpinner />}
			{parsedData && !isLoading && (
				<>
					<Filters
						filters={filters}
						onFilterChange={setFilters}
						onResetFilters={handleResetFilters}
						subjects={Array.from(new Set(parsedData.classes.map((c) => c.name)))}
						instructors={Array.from(new Set(parsedData.classes.map((c) => c.instructor)))}
					/>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
						<div className="lg:col-span-1">
							<ClassSearch
								classes={parsedData.classes}
								onAddClass={handleAddClass}
								onRemoveClass={handleRemoveClass}
								selectedClasses={selectedClasses}
								filters={filters}
								isLoading={isLoading}
							/>
						</div>
						<div className="lg:col-span-2">
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
						</div>
					</div>
				</>
			)}
		</div>
	);
}
