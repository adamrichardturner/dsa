import type { SeedModule } from "./types.js";
import { week1 } from "./week1.js";
import { week2 } from "./week2.js";
import { week3 } from "./week3.js";
import { week4 } from "./week4.js";

export const course: readonly SeedModule[] = [week1, week2, week3, week4];
