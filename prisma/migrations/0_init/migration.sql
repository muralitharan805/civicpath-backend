-- CreateExtension
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateTable
CREATE TABLE "public"."assembly_constituencies" (
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

-- CreateIndex
CREATE INDEX "assembly_constituencies_geom_geom_idx" ON "public"."assembly_constituencies" USING GIST ("geom");
