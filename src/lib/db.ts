import Dexie, { type EntityTable } from "dexie";
import type {
  Activity,
  AppNotification,
  Flashcard,
  Material,
  ReviewContent,
  StudySession,
  Subject,
  User,
} from "@/types";

class EasyStudyDB extends Dexie {
  users!: EntityTable<User, "id">;
  subjects!: EntityTable<Subject, "id">;
  activities!: EntityTable<Activity, "id">;
  studySessions!: EntityTable<StudySession, "id">;
  reviewContents!: EntityTable<ReviewContent, "id">;
  flashcards!: EntityTable<Flashcard, "id">;
  materials!: EntityTable<Material, "id">;
  notifications!: EntityTable<AppNotification, "id">;

  constructor() {
    // Keep existing IndexedDB name so current local data is preserved
    super("studyflow");
    this.version(1).stores({
      users: "id, email",
      subjects: "id, userId, name, createdAt",
      activities: "id, userId, subjectId, date, status, type, createdAt",
      studySessions: "id, userId, subjectId, startDate, status, createdAt",
      reviewContents: "id, userId, subjectId, updatedAt",
      flashcards: "id, userId, subjectId, category, createdAt",
      materials: "id, userId, subjectId, createdAt",
      notifications: "id, userId, read, scheduledAt, dedupeKey, createdAt",
    });
  }
}

export const db = new EasyStudyDB();
