import { ParsedData, Class, ClassSchedule } from "@/types/types";

export function parseCSV(content: string): Promise<ParsedData> {
	const lines = content.trim().split("\n");
	const headers = lines[0].split(",");
	const classMap = new Map<string, Class>();

	const worker = new Worker(
		URL.createObjectURL(
			new Blob(
				[
					`
          self.onmessage = function(e) {
            const lines = e.data.lines;
            const headers = e.data.headers;
            const classMap = new Map();

            const IdIndex = headers.indexOf("Mã LHP");
            const NameIndex = headers.indexOf("Tên môn học");
            const CreditsIndex = headers.indexOf("Số TC");
            const DayIndex = headers.indexOf("Thứ");
            const StartPeriodIndex = headers.indexOf("Từ tiết");
            const EndPeriodIndex = headers.indexOf("Đến tiết");
            const StartDateIndex = headers.indexOf("Bắt đầu");
            const EndDateIndex = headers.indexOf("Kết thúc");
            const TotalPeriodsIndex = headers.indexOf("Tổng số tiết");
            const RoomIndex = headers.indexOf("Phòng");
            const InstructorIndex = headers.indexOf("Giảng viên\\r");
            const WeeksIndexStart = headers.indexOf("T1");
            const WeeksIndexEnd = EndDateIndex - 1;

            for (let i = 1; i < lines.length; i++) {
              const values = lines[i].split(',');
              if (values.length === headers.length) {
                const classId = values[IdIndex];
                const schedule = {
                  day: parseInt(values[DayIndex]),
                  startPeriod: parseInt(values[StartPeriodIndex]),
                  endPeriod: parseInt(values[EndPeriodIndex]),
                  room: values[RoomIndex],
                  startDate: values[StartDateIndex],
                  endDate: values[EndDateIndex],
                  weeks: values.slice(WeeksIndexStart, WeeksIndexEnd + 1).map((v) => v.trim()),
                  totalPeriods: parseInt(values[TotalPeriodsIndex])
                };

                if (classMap.has(classId)) {
                  classMap.get(classId).schedules.push(schedule);
                } else {
                  classMap.set(classId, {
                    id: classId,
                    name: values[NameIndex],
                    credits: parseInt(values[CreditsIndex]),
                    instructor: values[InstructorIndex],
                    schedules: [schedule],
                  });
                }
              }
            }

            self.postMessage(Array.from(classMap.values()));
          }
        `,
				],
				{ type: "application/javascript" }
			)
		)
	);

	return new Promise((resolve, reject) => {
		worker.onmessage = function (e) {
			resolve({ classes: e.data });
			worker.terminate();
		};

		worker.onerror = reject;

		worker.postMessage({ lines, headers });
	});
}
