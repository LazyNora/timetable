"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Filters as FiltersType } from "@/types/types";

interface FiltersProps {
	filters: FiltersType;
	onFilterChange: (newFilters: FiltersType) => void;
	onResetFilters: () => void;
	subjects: string[];
	instructors: string[];
}

export default function Filters({
	filters,
	onFilterChange,
	onResetFilters,
	subjects,
	instructors,
}: FiltersProps) {
	const [openSubject, setOpenSubject] = React.useState(false);
	const [openInstructor, setOpenInstructor] = React.useState(false);

	const handleSubjectChange = (value: string) => {
		const newSubjects = filters.subject.includes(value)
			? filters.subject.filter((s) => s !== value)
			: [...filters.subject, value];
		onFilterChange({ ...filters, subject: newSubjects });
	};

	const handleInstructorChange = (value: string) => {
		const newInstructors = filters.instructor.includes(value)
			? filters.instructor.filter((i) => i !== value)
			: [...filters.instructor, value];
		onFilterChange({ ...filters, instructor: newInstructors });
	};

	return (
		<div className="mb-4 grid grid-cols-2 gap-4">
			<Popover open={openSubject} onOpenChange={setOpenSubject}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={openSubject}
						className="justify-between">
						{filters.subject.length > 0
							? `${filters.subject.length} subject(s) selected`
							: "Select subjects..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0">
					<Command>
						<CommandInput placeholder="Search subjects..." />
						<CommandList>
							<CommandEmpty>No subject found.</CommandEmpty>
							<CommandGroup>
								{subjects &&
									subjects.map((subject) => (
										<CommandItem key={subject} onSelect={() => handleSubjectChange(subject)}>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													filters.subject.includes(subject) ? "opacity-100" : "opacity-0"
												)}
											/>
											{subject}
										</CommandItem>
									))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>

			<Popover open={openInstructor} onOpenChange={setOpenInstructor}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={openInstructor}
						className="justify-between">
						{filters.instructor.length > 0
							? `${filters.instructor.length} instructor(s) selected`
							: "Select instructors..."}
						<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-full p-0">
					<Command>
						<CommandInput placeholder="Search instructors..." />
						<CommandList>
							<CommandEmpty>No instructor found.</CommandEmpty>
							<CommandGroup>
								{instructors &&
									instructors.map((instructor) => (
										<CommandItem
											key={instructor}
											onSelect={() => handleInstructorChange(instructor)}>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													filters.instructor.includes(instructor) ? "opacity-100" : "opacity-0"
												)}
											/>
											{instructor}
										</CommandItem>
									))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>

			<Select
				value={filters.timeSlot}
				onValueChange={(value: string) =>
					onFilterChange({
						...filters,
						timeSlot: value as "all" | "morning" | "afternoon" | "evening",
					})
				}>
				<SelectTrigger>
					<SelectValue placeholder="Select time slot" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Time Slots</SelectItem>
					<SelectItem value="morning">Morning</SelectItem>
					<SelectItem value="afternoon">Afternoon</SelectItem>
					<SelectItem value="evening">Evening</SelectItem>
				</SelectContent>
			</Select>

			<Select
				value={filters.dayOfWeek?.toString() || "all"}
				onValueChange={(value: string) =>
					onFilterChange({ ...filters, dayOfWeek: value === "all" ? null : parseInt(value) })
				}>
				<SelectTrigger>
					<SelectValue placeholder="Select day of week" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Days</SelectItem>
					<SelectItem value="2">Monday</SelectItem>
					<SelectItem value="3">Tuesday</SelectItem>
					<SelectItem value="4">Wednesday</SelectItem>
					<SelectItem value="5">Thursday</SelectItem>
					<SelectItem value="6">Friday</SelectItem>
					<SelectItem value="7">Saturday</SelectItem>
					<SelectItem value="8">Sunday</SelectItem>
				</SelectContent>
			</Select>

			<Button onClick={onResetFilters} variant="outline" className="col-span-2">
				Reset Filters
			</Button>
		</div>
	);
}
