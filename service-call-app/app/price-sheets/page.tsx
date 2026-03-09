"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/AuthContext";
import { storage } from "@/lib/firebaseConfig";
import db from "@/lib/firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import {
  Box,
  Typography,
  Button,
  TextField,
  LinearProgress,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocIcon,
  TableChart as ExcelIcon,
  Visibility as PreviewIcon,
  Edit as EditIcon,
  AutoAwesome as AutoAwesomeIcon,
  SortByAlpha as SortByAlphaIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import mammoth from "mammoth";

interface PriceSheet {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storageUrl: string;
  downloadUrl: string;
  uploadedBy: string;
  uploadedByName: string;
  tags: string[];
  textContent: string;
  createdAt: Date;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "text/csv",
];

const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.csv";

const ACCEPTED_EXT_SET = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".csv",
]);

function getExtension(fileName: string) {
  const idx = fileName.lastIndexOf(".");
  return idx >= 0 ? fileName.slice(idx).toLowerCase() : "";
}

function isSupportedFile(file: File) {
  const ext = getExtension(file.name);
  return ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXT_SET.has(ext);
}

function getFileIcon(fileType: string) {
  if (fileType.includes("pdf")) return <PdfIcon sx={{ fontSize: 40, color: "#e53935" }} />;
  if (fileType.includes("image")) return <ImageIcon sx={{ fontSize: 40, color: "#43a047" }} />;
  if (fileType.includes("sheet") || fileType.includes("excel") || fileType.includes("csv"))
    return <ExcelIcon sx={{ fontSize: 40, color: "#1e88e5" }} />;
  if (fileType.includes("word") || fileType.includes("document"))
    return <DocIcon sx={{ fontSize: 40, color: "#1565c0" }} />;
  return <FileIcon sx={{ fontSize: 40, color: "#757575" }} />;
}

function PdfThumbnail({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const pdf = await pdfjsLib.getDocument({ url }).promise;
        if (cancelled) return;

        const page = await pdf.getPage(1);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const viewport = page.getViewport({ scale: 1 });
        const scale = 136 / viewport.height;
        const scaledViewport = page.getViewport({ scale });

        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;

        const ctx = canvas.getContext("2d");
        if (!ctx) { setError(true); return; }

        await page.render({ canvasContext: ctx, viewport: scaledViewport, canvas }).promise;
        if (!cancelled) setRendered(true);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    render();
    return () => { cancelled = true; };
  }, [url]);

  if (error) return <PdfIcon sx={{ fontSize: 40, color: "#e53935" }} />;

  return (
    <>
      {!rendered && <PdfIcon sx={{ fontSize: 40, color: "#e53935" }} />}
      <canvas
        ref={canvasRef}
        style={{
          display: rendered ? "block" : "none",
          maxHeight: "100%",
          maxWidth: "100%",
        }}
      />
    </>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function canPreviewInBrowser(fileType: string, fileName: string): boolean {
  const ext = getExtension(fileName);
  return (
    fileType.includes("pdf") || ext === ".pdf" ||
    fileType.includes("image") || [".png", ".jpg", ".jpeg", ".webp"].includes(ext) ||
    fileType.includes("sheet") || fileType.includes("excel") || [".xls", ".xlsx"].includes(ext) ||
    fileType.includes("wordprocessingml") || ext === ".docx" ||
    fileType.includes("csv") || ext === ".csv"
  );
}

type SortOption = "newest" | "oldest" | "a-z" | "z-a";

export default function PriceSheetsPage() {
  const { user } = useAuth();
  const [files, setFiles] = useState<PriceSheet[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewFile, setPreviewFile] = useState<PriceSheet | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [pendingTags, setPendingTags] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [editFile, setEditFile] = useState<PriceSheet | null>(null);
  const [editFileName, setEditFileName] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState("");
  const [autoTagging, setAutoTagging] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [docPreviewHtml, setDocPreviewHtml] = useState<string>("");
  const [docPreviewLoading, setDocPreviewLoading] = useState(false);
  const [docPreviewSearch, setDocPreviewSearch] = useState("");
  const [previewFullscreen, setPreviewFullscreen] = useState(false);

  const fetchFiles = useCallback(async () => {
    try {
      const q = query(collection(db, "priceSheets"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const docs: PriceSheet[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          fileName: data.fileName || "",
          fileType: data.fileType || "",
          fileSize: data.fileSize || 0,
          storageUrl: data.storageUrl || "",
          downloadUrl: data.downloadUrl || "",
          uploadedBy: data.uploadedBy || "",
          uploadedByName: data.uploadedByName || "Unknown",
          tags: data.tags || [],
          textContent: data.textContent || "",
          createdAt: data.createdAt?.toDate?.() || new Date(),
        };
      });
      setFiles(docs);
    } catch (err) {
      console.error("Error fetching price sheets:", err);
      toast.error("Failed to load price sheets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchFiles();
  }, [user, fetchFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;

    const validFiles: File[] = [];

    for (let i = 0; i < selected.length; i++) {
      const file = selected[i];

      if (!isSupportedFile(file)) {
        toast.error(`"${file.name}" is not a supported file type`);
        continue;
      }

      if (file.size > 25 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds 25MB limit`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setPendingFiles(validFiles);
      setPendingTags([]);
      setTagInput("");
      setShowUploadDialog(true);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !pendingTags.includes(tag)) {
      setPendingTags([...pendingTags, tag]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPendingTags(pendingTags.filter((t) => t !== tagToRemove));
  };

  const extractTextContent = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        console.error("Text extraction API returned non-JSON response:", res.status, contentType);
        return "";
      }

      const data = await res.json();

      if (!res.ok) {
        console.error("Text extraction API failed:", data?.error || res.statusText);
        return "";
      }

      if (data?.error) {
        console.warn(`Extraction warning for ${file.name}:`, data.error);
      }

      return typeof data?.textContent === "string" ? data.textContent : "";
    } catch (err) {
      console.error("Text extraction failed for", file.name, err);
      return "";
    }
  };

  const handleUpload = async () => {
    if (!user || pendingFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    setShowUploadDialog(false);

    try {
      for (let i = 0; i < pendingFiles.length; i++) {
        const file = pendingFiles[i];
        const timestamp = Date.now();
        const storagePath = `priceSheets/${user.uid}/${timestamp}_${file.name}`;
        const storageRef = ref(storage, storagePath);

        const textContent = await extractTextContent(file);

        if (!textContent) {
          console.warn(`No extracted text for ${file.name}`);
        }

        await new Promise<void>((resolve, reject) => {
          const uploadTask = uploadBytesResumable(storageRef, file);

          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const fileProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              const overallProgress =
                ((i + fileProgress / 100) / pendingFiles.length) * 100;
              setUploadProgress(overallProgress);
            },
            (error) => {
              console.error("Upload error:", error);
              reject(error);
            },
            async () => {
              try {
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

                await addDoc(collection(db, "priceSheets"), {
                  fileName: file.name,
                  fileType: file.type || getExtension(file.name),
                  fileSize: file.size,
                  storageUrl: storagePath,
                  downloadUrl,
                  uploadedBy: user.uid,
                  uploadedByName: user.displayName || "Unknown",
                  tags: pendingTags,
                  textContent: textContent.slice(0, 50000),
                  createdAt: Timestamp.now(),
                });

                resolve();
              } catch (err) {
                reject(err);
              }
            }
          );
        });
      }

      toast.success(
        pendingFiles.length === 1
          ? "File uploaded successfully"
          : `${pendingFiles.length} files uploaded successfully`
      );

      setPendingFiles([]);
      setPendingTags([]);
      await fetchFiles();
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed. Make sure Firebase Storage is enabled.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const openEditDialog = (file: PriceSheet) => {
    setEditFile(file);
    setEditFileName(file.fileName);
    setEditTags([...file.tags]);
    setEditTagInput("");
  };

  const handleEditAddTag = () => {
    const tag = editTagInput.trim().toLowerCase();
    if (tag && !editTags.includes(tag)) {
      setEditTags([...editTags, tag]);
    }
    setEditTagInput("");
  };

  const handleEditSave = async () => {
    if (!editFile) return;
    try {
      await updateDoc(doc(db, "priceSheets", editFile.id), {
        fileName: editFileName.trim() || editFile.fileName,
        tags: editTags,
      });
      toast.success("File updated");
      setEditFile(null);
      await fetchFiles();
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update file");
    }
  };

  const handleAutoTag = async (fileNames: string[], textContent?: string) => {
    setAutoTagging(true);
    try {
      const res = await fetch("/api/auto-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: fileNames.join(", "),
          textContent: textContent || "",
        }),
      });
      const data = await res.json();
      return data.tags as string[];
    } catch (err) {
      console.error("Auto-tag error:", err);
      toast.error("Auto-tag failed");
      return [];
    } finally {
      setAutoTagging(false);
    }
  };

  const handleAutoTagUpload = async () => {
    const fileNames = pendingFiles.map((f) => f.name);
    let textContent = "";

    for (const file of pendingFiles) {
      const extracted = await extractTextContent(file);
      if (extracted) textContent += extracted + "\n";
    }

    const suggestedTags = await handleAutoTag(fileNames, textContent);
    const merged = [...new Set([...pendingTags, ...suggestedTags])];
    setPendingTags(merged);

    if (suggestedTags.length > 0) {
      toast.success(`Added ${suggestedTags.length} suggested tag(s)`);
    } else {
      toast("No tags suggested", { icon: "🤷" });
    }
  };

  const handleAutoTagEdit = async () => {
    if (!editFile) return;
    const suggestedTags = await handleAutoTag([editFile.fileName], editFile.textContent);
    const merged = [...new Set([...editTags, ...suggestedTags])];
    setEditTags(merged);

    if (suggestedTags.length > 0) {
      toast.success(`Added ${suggestedTags.length} suggested tag(s)`);
    } else {
      toast("No tags suggested", { icon: "🤷" });
    }
  };

  const handleDelete = async (file: PriceSheet) => {
    if (!confirm(`Delete "${file.fileName}"?`)) return;

    try {
      const storageRef = ref(storage, file.storageUrl);
      await deleteObject(storageRef);
      await deleteDoc(doc(db, "priceSheets", file.id));
      toast.success("File deleted");
      setFiles(files.filter((f) => f.id !== file.id));
      if (previewFile?.id === file.id) setPreviewFile(null);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete file");
    }
  };

  const handleDownload = (file: PriceSheet) => {
    const link = document.createElement("a");
    link.href = file.downloadUrl;
    link.target = "_blank";
    link.download = file.fileName;
    link.click();
  };

  const filteredFiles = files
    .filter((file) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();

      return (
        (file.fileName || "").toLowerCase().includes(q) ||
        (file.uploadedByName || "").toLowerCase().includes(q) ||
        (file.textContent || "").toLowerCase().includes(q) ||
        (file.tags || []).some((tag) => tag.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "a-z":
          return a.fileName.localeCompare(b.fileName, undefined, { sensitivity: "base" });
        case "z-a":
          return b.fileName.localeCompare(a.fileName, undefined, { sensitivity: "base" });
        case "oldest":
          return a.createdAt.getTime() - b.createdAt.getTime();
        case "newest":
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

  const loadDocPreview = async (file: PriceSheet) => {
    setPreviewFile(file);
    setDocPreviewHtml("");
    setDocPreviewSearch("");

    const ext = getExtension(file.fileName);
    const isExcel =
      file.fileType.includes("sheet") ||
      file.fileType.includes("excel") ||
      file.fileType.includes("csv") ||
      ext === ".xlsx" || ext === ".xls" || ext === ".csv";
    const isWord =
      file.fileType.includes("wordprocessingml") ||
      ext === ".docx";

    if (!isExcel && !isWord) return;

    setDocPreviewLoading(true);
    try {
      const response = await fetch(`/api/storage-proxy?path=${encodeURIComponent(file.storageUrl)}`);
      if (!response.ok) throw new Error("Download failed");
      const arrayBuffer = await response.arrayBuffer();

      if (isExcel) {
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        let html = "";
        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          html += `<h3 style="margin:16px 0 8px;font-size:16px;font-weight:600;">${sheetName}</h3>`;
          html += XLSX.utils.sheet_to_html(sheet, { editable: false });
        }
        setDocPreviewHtml(html);
      } else if (isWord) {
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setDocPreviewHtml(result.value);
      }
    } catch (err) {
      console.error("Document preview failed:", err);
      setDocPreviewHtml("<p style='color:#999;text-align:center;padding:32px;'>Failed to load preview.</p>");
    } finally {
      setDocPreviewLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Typography variant="h5">Please sign in to view Price Sheets</Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1">
        <header className="bg-white shadow-md py-4 px-4 sm:px-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Price Sheets</h1>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept={ACCEPTED_EXTENSIONS}
              multiple
              className="hidden"
            />
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              sx={{ backgroundColor: "black", "&:hover": { backgroundColor: "#333" } }}
            >
              Upload
            </Button>
          </div>
        </header>

        {uploading && (
          <Box sx={{ px: 3, py: 1 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption" sx={{ mt: 0.5 }}>
              Uploading... {Math.round(uploadProgress)}%
            </Typography>
          </Box>
        )}

        <div className="px-4 sm:px-6 py-4 flex gap-2 items-center">
          <TextField
            fullWidth
            placeholder="Search by name, content, tag, or uploader..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ backgroundColor: "white", borderRadius: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            sx={{ minWidth: 160, backgroundColor: "white", borderRadius: 1 }}
            SelectProps={{ native: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SortByAlphaIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="a-z">Name A–Z</option>
            <option value="z-a">Name Z–A</option>
          </TextField>
        </div>

        <div className="px-4 sm:px-6 pb-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <Typography color="textSecondary">Loading...</Typography>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-md">
              <FileIcon sx={{ fontSize: 64, color: "#ccc", mb: 2 }} />
              <Typography color="textSecondary">
                {searchQuery ? "No files match your search" : "No price sheets uploaded yet"}
              </Typography>
              {!searchQuery && (
                <Button
                  sx={{ mt: 2 }}
                  startIcon={<CloudUploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload your first price sheet
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div
                    className="h-36 bg-gray-50 flex items-center justify-center cursor-pointer border-b overflow-hidden"
                    onClick={() =>
                      canPreviewInBrowser(file.fileType, file.fileName)
                        ? loadDocPreview(file)
                        : handleDownload(file)
                    }
                  >
                    {file.fileType.includes("image") ? (
                      <img
                        src={file.downloadUrl}
                        alt={file.fileName}
                        className="h-full w-full object-contain"
                      />
                    ) : file.fileType.includes("pdf") ? (
                      <PdfThumbnail url={file.downloadUrl} />
                    ) : (
                      getFileIcon(file.fileType)
                    )}
                  </div>

                  <div className="p-3">
                    <Typography
                      variant="subtitle2"
                      noWrap
                      title={file.fileName}
                      sx={{ fontWeight: 600 }}
                    >
                      {file.fileName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatFileSize(file.fileSize)} &middot;{" "}
                      {file.createdAt.toLocaleDateString()}
                    </Typography>

                    {file.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {file.tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{ fontSize: "0.7rem", height: 20 }}
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end gap-1 mt-2">
                      {canPreviewInBrowser(file.fileType, file.fileName) && (
                        <IconButton
                          size="small"
                          onClick={() => loadDocPreview(file)}
                          title="Preview"
                        >
                          <PreviewIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(file)}
                        title="Edit"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(file)}
                        title="Download"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(file)}
                        title="Delete"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Upload {pendingFiles.length === 1 ? pendingFiles[0]?.name : `${pendingFiles.length} files`}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Add tags to help search for these price sheets later (e.g. game names, manufacturer, category).
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder='Add a tag (e.g. "skee-ball", "redemption")'
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <Button variant="outlined" onClick={handleAddTag} disabled={!tagInput.trim()}>
              Add
            </Button>
            <Button
              variant="outlined"
              onClick={handleAutoTagUpload}
              disabled={autoTagging}
              startIcon={<AutoAwesomeIcon />}
              sx={{ whiteSpace: "nowrap" }}
            >
              {autoTagging ? "..." : "Auto"}
            </Button>
          </Box>
          <div className="flex flex-wrap gap-1 mt-2">
            {pendingTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                size="small"
              />
            ))}
          </div>
          {pendingFiles.length > 1 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="textSecondary">
                Files to upload:
              </Typography>
              {pendingFiles.map((f, i) => (
                <Typography key={i} variant="body2">
                  {f.name} ({formatFileSize(f.size)})
                </Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            sx={{ backgroundColor: "black", "&:hover": { backgroundColor: "#333" } }}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!editFile}
        onClose={() => setEditFile(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Price Sheet</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="File Name"
            value={editFileName}
            onChange={(e) => setEditFileName(e.target.value)}
            size="small"
            sx={{ mt: 1, mb: 2 }}
          />
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            Tags
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Add a tag"
              value={editTagInput}
              onChange={(e) => setEditTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleEditAddTag();
                }
              }}
            />
            <Button variant="outlined" onClick={handleEditAddTag} disabled={!editTagInput.trim()}>
              Add
            </Button>
            <Button
              variant="outlined"
              onClick={handleAutoTagEdit}
              disabled={autoTagging}
              startIcon={<AutoAwesomeIcon />}
              sx={{ whiteSpace: "nowrap" }}
            >
              {autoTagging ? "..." : "Auto"}
            </Button>
          </Box>
          <div className="flex flex-wrap gap-1 mt-2">
            {editTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => setEditTags(editTags.filter((t) => t !== tag))}
                size="small"
              />
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditFile(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEditSave}
            sx={{ backgroundColor: "black", "&:hover": { backgroundColor: "#333" } }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!previewFile}
        onClose={() => {
          setPreviewFile(null);
          setDocPreviewHtml("");
          setDocPreviewSearch("");
          setPreviewFullscreen(false);
        }}
        maxWidth="lg"
        fullWidth
        fullScreen={previewFullscreen}
        PaperProps={{ sx: { height: previewFullscreen ? "100vh" : "90vh" } }}
      >
        {previewFile && (
          <>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
              <Typography variant="h6" noWrap sx={{ flex: 1, minWidth: 0 }}>
                {previewFile.fileName}
              </Typography>
              {docPreviewHtml && (
                <TextField
                  size="small"
                  placeholder="Search in document..."
                  value={docPreviewSearch}
                  onChange={(e) => setDocPreviewSearch(e.target.value)}
                  sx={{ width: 220 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              <Box>
                <IconButton onClick={() => handleDownload(previewFile)} title="Download">
                  <DownloadIcon />
                </IconButton>
                <IconButton onClick={() => setPreviewFullscreen((f) => !f)} title={previewFullscreen ? "Exit fullscreen" : "Fullscreen"}>
                  {previewFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
                <IconButton onClick={() => {
                  setPreviewFile(null);
                  setDocPreviewHtml("");
                  setDocPreviewSearch("");
                  setPreviewFullscreen(false);
                }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 0, display: "flex", justifyContent: "center", alignItems: "center", overflow: "auto" }}>
              {previewFile.fileType.includes("pdf") ? (
                <iframe
                  src={previewFile.downloadUrl}
                  title={previewFile.fileName}
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              ) : previewFile.fileType.includes("image") ? (
                <img
                  src={previewFile.downloadUrl}
                  alt={previewFile.fileName}
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
              ) : docPreviewLoading ? (
                <Box sx={{ textAlign: "center", p: 4 }}>
                  <LinearProgress sx={{ width: 200, mb: 2 }} />
                  <Typography color="textSecondary">Loading preview...</Typography>
                </Box>
              ) : docPreviewHtml ? (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    overflow: "auto",
                    p: 3,
                    "& table": {
                      borderCollapse: "collapse",
                      width: "100%",
                      fontSize: "0.875rem",
                    },
                    "& th, & td": {
                      border: "1px solid #ddd",
                      padding: "6px 10px",
                      textAlign: "left",
                    },
                    "& th": {
                      backgroundColor: "#f5f5f5",
                      fontWeight: 600,
                    },
                    "& tr:nth-of-type(even)": {
                      backgroundColor: "#fafafa",
                    },
                    "& mark": {
                      backgroundColor: "#fff176",
                      padding: "0 2px",
                      borderRadius: "2px",
                    },
                  }}
                  dangerouslySetInnerHTML={{
                    __html: docPreviewSearch.trim()
                      ? docPreviewHtml.replace(
                          new RegExp(
                            `(${docPreviewSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
                            "gi"
                          ),
                          "<mark>$1</mark>"
                        )
                      : docPreviewHtml,
                  }}
                />
              ) : (
                <Box sx={{ textAlign: "center", p: 4 }}>
                  {getFileIcon(previewFile.fileType)}
                  <Typography sx={{ mt: 2 }}>
                    Preview not available for this file type.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(previewFile)}
                    sx={{ mt: 2, backgroundColor: "black", "&:hover": { backgroundColor: "#333" } }}
                  >
                    Download to view
                  </Button>
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </div>
  );
}