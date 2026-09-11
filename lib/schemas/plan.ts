import { z } from "zod";

export const relationshipValues = ["solo", "couple", "friends", "parents", "family_with_children"] as const;
export const styleValues = ["nature_healing", "cafe_gourmet", "activity", "culture_history"] as const;

export const tripInputSchema = z
  .object({
    destination: z.string().trim().min(1, "여행지를 도시 또는 지역명으로 입력해주세요.").max(100),
    departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "출발일을 다시 입력해주세요."),
    arrivalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "도착일을 다시 입력해주세요."),
    travelerCount: z.enum(["1", "2", "3-4", "5+"]),
    relationship: z.enum(relationshipValues),
    totalBudgetKrw: z.number().int().positive("총예산을 1원 이상의 숫자로 입력해주세요."),
    styles: z.array(z.enum(styleValues)),
    avoidances: z.array(z.string().trim().min(1).max(100))
  })
  .superRefine((value, context) => {
    if (value.arrivalDate < value.departureDate) {
      context.addIssue({ code: "custom", path: ["arrivalDate"], message: "도착일은 출발일 이후여야 합니다." });
    }
    if (value.travelerCount === "1" && value.relationship !== "solo") {
      context.addIssue({ code: "custom", path: ["relationship"], message: "1명 여행은 혼자 여행 관계를 선택해주세요." });
    }
    if (value.travelerCount !== "1" && value.relationship === "solo") {
      context.addIssue({ code: "custom", path: ["relationship"], message: "2명 이상 여행은 동행자 관계를 선택해주세요." });
    }
  });

export type TripInput = z.infer<typeof tripInputSchema>;

export const defaultTripInput: TripInput = {
  destination: "",
  departureDate: "",
  arrivalDate: "",
  travelerCount: "2",
  relationship: "couple",
  totalBudgetKrw: 1200000,
  styles: ["nature_healing", "cafe_gourmet"],
  avoidances: ["긴 도보 이동(1시간 이상)", "대기시간 40분 이상 맛집"]
};

const sourceSchema = z.enum(["ai", "user"]);
export const planItemSchema = z.object({
  id: z.string().min(1),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  type: z.enum(["activity", "meal", "transport", "rest"]),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  estimatedCostKrw: z.number().int().nonnegative().optional(),
  priceStatus: z.literal("estimate").optional(),
  source: sourceSchema.default("ai")
});

export const generatedPlanSchema = z.object({
  version: z.literal(1),
  source: sourceSchema.default("ai"),
  input: tripInputSchema,
  summary: z.object({
    title: z.string().min(1).max(120),
    destination: z.string().min(1),
    duration: z.object({ nights: z.number().int().nonnegative(), days: z.number().int().positive() }),
    movementFatigue: z.object({ level: z.enum(["low", "medium", "high"]), reason: z.string().min(1).max(300), source: sourceSchema.default("ai") })
  }),
  days: z.array(z.object({ id: z.string().min(1), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), title: z.string().min(1).max(120), source: sourceSchema.default("ai"), items: z.array(planItemSchema).min(1) })).min(1),
  budget: z.object({
    currency: z.literal("KRW"), totalBudgetKrw: z.number().int().positive(),
    categories: z.array(z.object({ id: z.string().min(1), name: z.string().min(1).max(60), amountKrw: z.number().int().nonnegative(), source: sourceSchema.default("ai") })).min(1),
    allocatedTotalKrw: z.number().int().nonnegative(), remainingKrw: z.number().int(),
    perPerson: z.object({ minKrw: z.number().int().nonnegative(), maxKrw: z.number().int().nonnegative() }), priceStatus: z.literal("estimate")
  }),
  checklist: z.array(z.object({ id: z.string().min(1), label: z.string().min(1).max(120), checked: z.boolean(), source: sourceSchema.default("ai") })).min(1),
  rainyAlternatives: z.array(z.object({ id: z.string().min(1), dayId: z.string().min(1), originalItemId: z.string().min(1), replacementTitle: z.string().min(1).max(120), description: z.string().min(1).max(500), source: sourceSchema.default("ai") })).min(1),
  notices: z.array(z.string().min(1).max(300)).min(2)
});

export type GeneratedPlan = z.infer<typeof generatedPlanSchema>;
