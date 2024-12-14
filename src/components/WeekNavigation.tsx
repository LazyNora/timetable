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
				onClick={() => onWeekChange(Math.max(1, currentWeek - 1))}
				disabled={currentWeek === 1}>
				Tuần Trước
			</Button>
			<span className="text-lg font-bold">
				Tuần {currentWeek}: {getWeekDates()}
			</span>
			<Button
				onClick={() => onWeekChange(Math.min(totalWeeks, currentWeek + 1))}
				disabled={currentWeek === totalWeeks}>
				Tuần Sau
			</Button>
		</div>
	);
}
