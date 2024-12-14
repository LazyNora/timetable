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

            for (let i = 1; i < lines.length; i++) {
              const values = lines[i].split(',');
              if (values.length === headers.length) {
                const classId = values[1];
                const schedule = {
                  day: parseInt(values[5]),
                  startPeriod: parseInt(values[6]),
                  endPeriod: parseInt(values[7]),
                  room: values[44],
                  startDate: values[9],
                  endDate: values[42],
                  weeks: values.slice(10, 42).map((v) => v.trim()),
                  totalPeriods: parseInt(values[43])
                };

                if (classMap.has(classId)) {
                  classMap.get(classId).schedules.push(schedule);
                } else {
                  classMap.set(classId, {
                    id: classId,
                    name: values[2],
                    instructor: values[45],
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
