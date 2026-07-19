/*
  Warnings:

  - You are about to drop the `assembly_constituencies` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `parliment_constituencies` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "core";

-- DropTable
DROP TABLE "assembly_constituencies";

-- DropTable
DROP TABLE "parliment_constituencies";

-- CreateTable
CREATE TABLE "core"."assembly_constituencies" (
    "ogc_fid" SERIAL NOT NULL,
    "objectid" DECIMAL(9,0),
    "st_code" DECIMAL(10,0),
    "st_name" VARCHAR(254),
    "dt_code" DECIMAL(10,0),
    "dist_name" VARCHAR(254),
    "ac_no" DECIMAL(10,0),
    "ac_name" VARCHAR(254),
    "pc_no" DECIMAL(10,0),
    "pc_name" VARCHAR(254),
    "pc_id" DECIMAL(10,0),
    "status" VARCHAR(254),
    "shape_leng" DECIMAL(18,11),
    "shape_area" DECIMAL(18,11),
    "geom" geometry,

    CONSTRAINT "assembly_constituencies_pkey" PRIMARY KEY ("ogc_fid")
);

-- CreateTable
CREATE TABLE "core"."districts" (
    "ogc_fid" SERIAL NOT NULL,
    "district" VARCHAR(28),
    "st_nm" VARCHAR(24),
    "st_cen_cd" DECIMAL(9,0),
    "dt_cen_cd" DECIMAL(9,0),
    "censuscode" DECIMAL(14,0),
    "geom" geometry,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("ogc_fid")
);

-- CreateTable
CREATE TABLE "core"."parliment_constituencies" (
    "ogc_fid" SERIAL NOT NULL,
    "st_name" VARCHAR(254),
    "pc_name" VARCHAR(254),
    "st_code" VARCHAR(3),
    "pc_code" DECIMAL(4,0),
    "res" VARCHAR(4),
    "geom" geometry,

    CONSTRAINT "parliment_constituencies_pkey" PRIMARY KEY ("ogc_fid")
);

-- CreateIndex
CREATE INDEX "assembly_constituencies_geom_geom_idx" ON "core"."assembly_constituencies" USING GIST ("geom");

-- CreateIndex
CREATE INDEX "districts_geom_geom_idx" ON "core"."districts" USING GIST ("geom");

-- CreateIndex
CREATE INDEX "parliment_constituencies_geom_geom_idx" ON "core"."parliment_constituencies" USING GIST ("geom");
