import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Class, ClassSchedule } from "@/types/types";

interface SelectedClassesSummaryProps {
	selectedClasses: Class[];
	onRemoveClass: (classId: string) => void;
}

export default function SelectedClassesSummary({
	selectedClasses,
	onRemoveClass,
}: SelectedClassesSummaryProps) {
	const getDayOfWeek = (day: number) => {
		const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
		return days[(day - 1) % 7];
	};

	return (
		<div className="mb-4 p-4 border rounded-lg bg-white">
			<h2 className="text-lg font-semibold mb-2">Selected Classes</h2>
			<ScrollArea className="h-[300px]">
				{selectedClasses.map((cls) => (
					<div key={cls.id} className="mb-4 p-4 bg-gray-100 rounded">
						<div className="flex justify-between items-start mb-2">
							<div>
								<div className="font-medium">{cls.name}</div>
								<div className="text-sm text-gray-600">ID: {cls.id}</div>
								<div className="text-sm text-gray-600">GV: {cls.instructor}</div>
								<div className="text-sm text-gray-600">STC: {cls.credits}</div>
							</div>
							<Button variant="destructive" size="sm" onClick={() => onRemoveClass(cls.id)}>
								Remove
							</Button>
						</div>
						<div className="text-sm text-gray-600">
							{cls.schedules.map((s: ClassSchedule, i: number) => (
								<div key={`${cls.id}-${s.day}-${s.startPeriod}-${i}`} className="mb-1">
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
				))}
			</ScrollArea>
		</div>
	);
}
