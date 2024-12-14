export interface ClassSchedule {
	day: number;
	startPeriod: number;
	endPeriod: number;
	room: string;
	startDate: string;
	endDate: string;
	weeks: string[];
	totalPeriods: number;
}

export interface Class {
	id: string;
	name: string;
	schedules: ClassSchedule[];
	instructor: string;
}

export interface ParsedData {
	classes: Class[];
}

export type TimeSlot = "morning" | "afternoon" | "evening";

export interface Filters {
	subject: string[];
	instructor: string[];
	timeSlot: "all" | "morning" | "afternoon" | "evening";
	dayOfWeek: number | null;
}
