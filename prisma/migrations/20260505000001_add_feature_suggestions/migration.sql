CREATE TABLE "FeatureSuggestion" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureSuggestion_pkey" PRIMARY KEY ("id")
);
