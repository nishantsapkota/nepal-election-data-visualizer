"use client";

import { useState, useCallback } from "react";
import { useVoters } from "@/lib/voter-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";

export function UploadSection() {
  const { loadCsvData, voters, isUsingCsvData } = useVoters();
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [uploadMessage, setUploadMessage] = useState("");

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".csv")) {
        setUploadStatus("error");
        setUploadMessage("Please upload a CSV file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          try {
            loadCsvData(text);
            setUploadStatus("success");
            setUploadMessage(`Successfully loaded data from ${file.name}`);
          } catch {
            setUploadStatus("error");
            setUploadMessage(
              "Failed to parse CSV file. Please check the format.",
            );
          }
        }
      };
      reader.readAsText(file);
    },
    [loadCsvData],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="flex flex-col gap-4">
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-card-foreground flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" />
            Upload Voter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Drag and drop your CSV file here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click the button below to browse
                  </p>
                </div>
                <label>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleInputChange}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="cursor-pointer"
                  >
                    <span>Choose CSV File</span>
                  </Button>
                </label>
              </div>
            </div>

            {/* Status Message */}
            {uploadStatus !== "idle" && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  uploadStatus === "success"
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {uploadStatus === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span className="text-sm">{uploadMessage}</span>
              </div>
            )}

            {/* Current Data Info
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
              <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">
                  {isUsingCsvData ? "Using uploaded CSV data" : "Using sample data"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Currently loaded: {voters.length.toLocaleString()} voter records
                </p>
              </div>
              {isUsingCsvData && <Badge className="bg-success text-success-foreground ml-auto">CSV Loaded</Badge>}
            </div> */}

            {/* Expected Format */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Expected CSV Format
              </h3>
              <div className="overflow-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">
                        Column
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">
                        Description
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-muted-foreground">
                        Example
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["voter_id", "Unique voter ID", "KV1-000001"],
                      ["name", "Full name", "Ram Shrestha"],
                      ["age", "Age in years", "35"],
                      ["gender", "Male/Female/Other", "Male"],
                      ["parent_name", "Parent's name", "Hari Shrestha"],
                      ["spouse", "Spouse name (optional)", "Sita Tamang"],
                      ["picture", "Photo URL or path", "https://..."],
                      [
                        "municipality",
                        "Municipality name",
                        "Banepa Municipality",
                      ],
                      ["ward", "Ward number", "Ward 5"],
                      ["booth", "Booth number", "Booth 3"],
                    ].map(([col, desc, example]) => (
                      <tr key={col} className="border-t border-border/50">
                        <td className="py-2 px-3 font-mono text-primary">
                          {col}
                        </td>
                        <td className="py-2 px-3 text-foreground">{desc}</td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {example}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
