import { z } from "zod";

const createPlanSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "Name is required",
    }),
    priceMonthly: z.number({
      required_error: "Monthly price is required",
    }),
    priceYearly: z.number({
      required_error: "Yearly price is required",
    }),
    stripeMonthlyPriceId: z.string({
      required_error: "Stripe Monthly Price ID is required",
    }),
    stripeYearlyPriceId: z.string({
      required_error: "Stripe Yearly Price ID is required",
    }),
    employeeLimit: z.number({
      required_error: "Employee limit is required",
    }),
    // trialDays: z.number().optional(), // Commented for now
    isActive: z.boolean().optional(),
  }),
});

const updatePlanSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    priceMonthly: z.number().optional(),
    priceYearly: z.number().optional(),
    stripeMonthlyPriceId: z.string().optional(),
    stripeYearlyPriceId: z.string().optional(),
    employeeLimit: z.number().optional(),
    // trialDays: z.number().optional(), // Commented for now
    isActive: z.boolean().optional(),
  }),
});

export const PlanValidation = {
  createPlanSchema,
  updatePlanSchema,
};
