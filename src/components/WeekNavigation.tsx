import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface WeekNavigationProps {
	currentWeek: number;
	onWeekChange: (week: number) => void;
	totalWeeks: number;
	startDate: Date;
}

export default function WeekNavigation({
	currentWeek,
	onWeekChange,
	totalWeeks,
	startDate,
}: WeekNavigationProps) {
	const getWeekDates = () => {
		const weekStart = new Date(startDate);
		weekStart.setDate(weekStart.getDate() + (currentWeek - 1) * 7);
		const weekEnd = new Date(weekStart);
		weekEnd.setDate(weekEnd.getDate() + 6);
		return `${weekStart.toLocaleDateString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		})} - ${weekEnd.toLocaleDateString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		})}`;
	};

	return (
		<div className="flex justify-between items-center mb-4">
			<Button
				size="icon"
				onClick={() => onWeekChange(Math.max(1, currentWeek - 1))}
				disabled={currentWeek === 1}>
				<ChevronLeft size={24} />
			</Button>
			<span className="md:text-lg font-bold text-center">
				Tuần {currentWeek}
				<br />
				<span className="text-sm md:text-base font-normal">{getWeekDates()}</span>
			</span>
			<Button
				size="icon"
				onClick={() => onWeekChange(Math.min(totalWeeks, currentWeek + 1))}
				disabled={currentWeek === totalWeeks}>
				<ChevronRight size={24} />
			</Button>
		</div>
	);
}
