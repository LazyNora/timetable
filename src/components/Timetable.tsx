import { Class, TimeSlot } from "@/types/types";

interface TimetableProps {
	classes: Class[];
	currentWeek: number;
	startDate: Date;
}

export default function Timetable({ classes, currentWeek, startDate }: TimetableProps) {
	const days = [
		{ id: 2, name: "Thứ 2" },
		{ id: 3, name: "Thứ 3" },
		{ id: 4, name: "Thứ 4" },
		{ id: 5, name: "Thứ 5" },
		{ id: 6, name: "Thứ 6" },
		{ id: 7, name: "Thứ 7" },
		{ id: 8, name: "Chủ nhật" },
	];

	const timeSlots: { id: TimeSlot; name: string; periods: number[] }[] = [
		{ id: "morning", name: "Sáng", periods: [1, 2, 3, 4, 5, 6] },
		{ id: "afternoon", name: "Chiều", periods: [7, 8, 9, 10, 11, 12] },
		{ id: "evening", name: "Tối", periods: [13, 14, 15, 16, 17] },
	];

	const getClassesForSlot = (day: number, periodRange: number[]) => {
		return classes.filter((c) =>
			c.schedules.some(
				(s) =>
					s.day === day &&
					s.weeks[currentWeek - 1] === "x" &&
					s.startPeriod >= Math.min(...periodRange) &&
					s.endPeriod <= Math.max(...periodRange)
			)
		);
	};

	const getDateForDay = (dayId: number) => {
		const date = new Date(startDate);
		date.setDate(date.getDate() + (dayId - 2) + (currentWeek - 1) * 7);
		return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
	};

	const getClassColor = (room: string) => {
		if (room.toLowerCase().includes("zoom")) {
			return "bg-blue-100";
		} else if (room.match(/^A[12]\d{2}/)) {
			return "bg-green-100";
		} else {
			return "bg-gray-100";
		}
	};

	return (
		<div className="border rounded-lg overflow-hidden">
			<table className="w-full border-collapse">
				<thead className="sticky top-0 bg-white z-10">
					<tr className="bg-gray-50">
						<th className="border p-2 w-24">Ca học</th>
						{days.map((day) => (
							<th key={day.id} className="border p-2 text-center">
								{day.name}
								<br />
								{getDateForDay(day.id)}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{timeSlots.map((slot) => (
						<tr key={slot.id} className="h-40">
							<td className="border p-2 font-medium text-center bg-gray-50">{slot.name}</td>
							{days.map((day) => (
								<td key={`${day.id}-${slot.id}`} className="border p-2 align-top">
									{getClassesForSlot(day.id, slot.periods).map((c) =>
										c.schedules
											.filter(
												(s) =>
													s.day === day.id &&
													s.weeks[currentWeek - 1] === "x" &&
													s.startPeriod >= Math.min(...slot.periods) &&
													s.endPeriod <= Math.max(...slot.periods)
											)
											.map((schedule, index) => (
												<div
													key={`${c.id}-${day.id}-${schedule.startPeriod}-${index}`}
													className={`mb-2 p-2 rounded text-sm ${getClassColor(schedule.room)}`}>
													<div className="font-semibold">{c.name}</div>
													<div>ID: {c.id}</div>
													<div>
														Tiết: {schedule.startPeriod} - {schedule.endPeriod}
													</div>
													<div>Phòng: {schedule.room}</div>
													<div>GV: {c.instructor}</div>
												</div>
											))
									)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
