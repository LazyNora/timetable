import { useState, useEffect, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Class, ClassSchedule } from "@/types/types";
import LoadingSpinner from "./LoadingSpinner";

interface Filters {
	subject: string[];
	instructor: string[];
	timeSlot: "all" | "morning" | "afternoon" | "evening";
	dayOfWeek: number | null;
}

interface ClassSearchProps {
	classes: Class[];
	onAddClass: (selectedClass: Class) => void;
	onRemoveClass: (classId: string) => void;
	selectedClasses: Class[];
	filters: Filters;
	isLoading: boolean;
}

export default function ClassSearch({
	classes,
	onAddClass,
	onRemoveClass,
	selectedClasses,
	filters,
	isLoading,
}: ClassSearchProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [searchResults, setSearchResults] = useState<Class[]>([]);

	const filteredClasses = useMemo(() => {
		return classes.filter((c) => {
			const matchesSubject = filters.subject.length === 0 || filters.subject.includes(c.name);
			const matchesInstructor =
				filters.instructor.length === 0 || filters.instructor.includes(c.instructor);
			const matchesTimeSlot =
				filters.timeSlot === "all" ||
				c.schedules.some(
					(s) =>
						(filters.timeSlot === "morning" && s.startPeriod <= 6) ||
						(filters.timeSlot === "afternoon" && s.startPeriod > 6 && s.startPeriod <= 12) ||
						(filters.timeSlot === "evening" && s.startPeriod > 12)
				);
			const matchesDayOfWeek =
				!filters.dayOfWeek || c.schedules.some((s) => s.day === filters.dayOfWeek);

			return matchesSubject && matchesInstructor && matchesTimeSlot && matchesDayOfWeek;
		});
	}, [classes, filters]);

	useEffect(() => {
		setSearchResults(
			filteredClasses.filter(
				(c) =>
					c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					c.id.toString().includes(searchTerm)
			)
		);
	}, [filteredClasses, searchTerm]);

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	};

	const hasScheduleConflict = (newClass: Class) => {
		for (const existingClass of selectedClasses) {
			for (const newSchedule of newClass.schedules) {
				for (const existingSchedule of existingClass.schedules) {
					if (hasOverlap(newSchedule, existingSchedule)) {
						return true;
					}
				}
			}
		}
		return false;
	};

	const hasOverlap = (schedule1: ClassSchedule, schedule2: ClassSchedule) => {
		if (schedule1.day !== schedule2.day) return false;

		const hasWeekOverlap = schedule1.weeks.some(
			(week, index) => week === "x" && schedule2.weeks[index] === "x"
		);
		if (!hasWeekOverlap) return false;

		return !(
			schedule1.endPeriod < schedule2.startPeriod || schedule1.startPeriod > schedule2.endPeriod
		);
	};

	const getDayOfWeek = (day: number) => {
		const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
		return days[(day - 1) % 7];
	};

	const parentRef = useRef<HTMLDivElement>(null);

	const rowVirtualizer = useVirtualizer({
		count: searchResults.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 180,
		overscan: 5,
	});

	if (isLoading) {
		return <LoadingSpinner />;
	}

	return (
		<div className="mb-4">
			<input
				type="text"
				placeholder="Search for a class"
				value={searchTerm}
				onChange={handleSearch}
				className="w-full p-2 border rounded mb-2"
			/>
			<ScrollArea ref={parentRef} className="h-[calc(100vh-200px)] overflow-y-auto">
				<div
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						width: "100%",
						position: "relative",
					}}>
					{rowVirtualizer.getVirtualItems().map((virtualRow) => {
						const c = searchResults[virtualRow.index];
						const isSelected = selectedClasses.some((sc) => sc.id === c.id);
						const hasConflict = !isSelected && hasScheduleConflict(c);
						return (
							<div
								key={c.id}
								ref={rowVirtualizer.measureElement}
								data-index={virtualRow.index}
								style={{
									paddingRight: "1px",
									paddingBlock: "0.5rem",
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									// height: `${virtualRow.size}px`,
									transform: `translateY(${virtualRow.start}px)`,
								}}>
								<div className="flex flex-col p-3 bg-white border rounded-lg">
									<div className="flex justify-between items-start mb-2">
										<div>
											<div className="font-medium">{c.name}</div>
											<div className="text-sm text-gray-600">ID: {c.id}</div>
											<div className="text-sm text-gray-600">GV: {c.instructor}</div>
											<div className="text-sm text-gray-600">STC: {c.credits}</div>
										</div>
										<button
											onClick={() =>
												isSelected ? onRemoveClass(c.id) : !hasConflict && onAddClass(c)
											}
											className={`px-4 py-2 rounded ${
												isSelected
													? "bg-red-500 text-white hover:bg-red-600"
													: hasConflict
													? "bg-gray-300 cursor-not-allowed"
													: "bg-blue-500 text-white hover:bg-blue-600"
											}`}
											disabled={!isSelected && hasConflict}>
											{isSelected ? "Remove" : hasConflict ? "Conflict" : "Add"}
										</button>
									</div>
									<div className="text-sm text-gray-600">
										{c.schedules.map((s, i) => (
											<div key={`${c.id}-${s.day}-${s.startPeriod}-${i}`} className="mb-1">
												<div>
													{getDayOfWeek(s.day)}: Tiết {s.startPeriod}-{s.endPeriod}
												</div>
												<div>Phòng: {s.room}</div>
												<div>
													Từ: {s.startDate} - Đến: {s.endDate}
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</ScrollArea>
		</div>
	);
}
