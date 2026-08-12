export type ScheduleItem =
  | {
      type: "work";
      start: string;
      end: string;
    }
  | {
      type: "break";
      start: string;
      end: string;
      label: string;
    };


export const todaySchedule: ScheduleItem[] = [
  {
            type: "work",
            start: "08:55",
            end: "09:25",
        },
        {
            type: "work",
            start: "09:25",
            end: "09:55",
        },
        {
            type: "work",
            start: "09:55",
            end: "10:25",
        },
        {
            type: "work",
            start: "10:25",
            end: "10:55",
        },
        {
            type: "work",
            start: "10:55",
            end: "11:25",
        },
        {
            type: "work",
            start: "11:25",
            end: "11:55",
        },

        // 점심시간
        {
            type: "break",
            label: "점심시간",
            start: "11:55",
            end: "12:55",
        },
        // 점심시간

        {
            type: "work",
            start: "12:55",
            end: "13:25",
        },
        {
            type: "work",
            start: "13:25",
            end: "13:55",
        },
        {
            type: "work",
            start: "13:55",
            end: "14:25",
        },
        {
            type: "work",
            start: "14:25",
            end: "14:55",
        },
        {
            type: "work",
            start: "14:55",
            end: "15:25",
        },
        {
            type: "work",
            start: "15:25",
            end: "15:55",
        },
        {
            type: "work",
            start: "15:55",
            end: "16:25",
        },
];
