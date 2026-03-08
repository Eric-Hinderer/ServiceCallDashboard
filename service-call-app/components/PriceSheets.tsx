"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { storage } from "@/lib/firebaseConfig";
import db from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
import {
  FileText,
  FileSpreadsheet,
  File,
  Image as ImageIcon,
  Upload,
  Search,
  Download,
  Trash2,
  X,
  Eye,
} from "lucide-react";

interface PriceSheetDoc {
  id: string;
  name: string;
  storagePath: string;
  downloadURL: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: Date;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(fileType: string) {
  if (fileType.includes("pdf"))
    return <FileText className="w-8 h-8 text-red-500" />;
  if (
    fileType.includes("spreadsheet") ||
    fileType.includes("excel") ||
    fileType.includes("csv") ||
    fileType.endsWith("xlsx") ||
    fileType.endsWith("xls")
  )
    return <FileSpreadsheet className="w-8 h-8 text-green-600" />;
  if (fileType.startsWith("image/"))
    return <ImageIcon className="w-8 h-8 text-blue-500" />;
  if (
    fileType.includes("word") ||
    fileType.includes("document") ||
    fileType.endsWith("doc") ||
    fileType.endsWith("docx")
  )
    return <FileText className="w-8 h-8 text-blue-600" />;
  return <File className="w-8 h-8 text-gray-500" />;
}

function canPreviewInBrowser(fileType: string): boolean {
  return (
    fileType === "application/pdf" ||
    fileType.startsWith("image/") ||
    fileType === "text/plain" ||
    fileType === "text/csv"
  );
}

export default function PriceSheets() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<PriceSheetDoc[]>([]);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<PriceSheetDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "priceSheets"),
        orderBy("uploadedAt", "desc")
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<PriceSheetDoc, "id" | "uploadedAt">),
        uploadedAt: d.data().uploadedAt?.toDate?.() ?? new Date(),
      })) as PriceSheetDoc[];
      setDocuments(docs);
    } catch {
      toast.error("Failed to load price sheets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || !user) return;

      const allowed = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/csv",
        "text/plain",
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/webp",
      ];

      const file = files[0];
      if (!allowed.includes(file.type)) {
        toast.error(
          "Unsupported file type. Please upload PDF, Excel, Word, CSV, or image files."
        );
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      const storagePath = `priceSheets/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        () => {
          toast.error("Upload failed. Please try again.");
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, "priceSheets"), {
            name: file.name,
            storagePath,
            downloadURL,
            fileType: file.type,
            fileSize: file.size,
            uploadedBy: user.displayName || user.email || "Unknown",
            uploadedAt: serverTimestamp(),
          });
          toast.success(`"${file.name}" uploaded successfully!`);
          setUploading(false);
          setUploadProgress(0);
          fetchDocuments();
        }
      );
    },
    [user, fetchDocuments]
  );

  const handleDelete = async (document: PriceSheetDoc) => {
    if (!confirm(`Delete "${document.name}"?`)) return;
    try {
      const storageRef = ref(storage, document.storagePath);
      await deleteObject(storageRef);
      await deleteDoc(doc(db, "priceSheets", document.id));
      setDocuments((prev) => prev.filter((d) => d.id !== document.id));
      toast.success(`"${document.name}" deleted.`);
    } catch {
      toast.error("Failed to delete. Please try again.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  };

  const filtered = documents.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Page Header */}
      <header className="bg-white shadow-md py-4 px-4 sm:px-6">
        <h1 className="text-xl font-semibold">Price Sheets</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload, search, preview, and download price sheet documents.
        </p>
      </header>

      <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto space-y-6">
        {/* Upload Zone */}
        {user && (
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.xlsx,.xls,.doc,.docx,.csv,.txt,.png,.jpg,.jpeg,.gif,.webp"
              onChange={(e) => handleUpload(e.target.files)}
            />
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            {uploading ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Uploading... {uploadProgress}%
                </p>
                <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700">
                  Drag & drop a file here, or{" "}
                  <span className="text-blue-600 underline">browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supports PDF, Excel, Word, CSV, and image files
                </p>
              </>
            )}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search price sheets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm p-4 animate-pulse h-28"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <File className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              {search ? "No results found." : "No price sheets uploaded yet."}
            </p>
            {!search && user && (
              <p className="text-sm text-gray-400 mt-1">
                Upload your first file using the drop zone above.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">{getFileIcon(doc.fileType)}</div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="font-medium text-gray-800 text-sm truncate"
                      title={doc.name}
                    >
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatBytes(doc.fileSize)} &middot;{" "}
                      {doc.uploadedAt instanceof Date
                        ? doc.uploadedAt.toLocaleDateString()
                        : ""}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {doc.uploadedBy}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </button>
                  <a
                    href={doc.downloadURL}
                    download={doc.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                  {user && (
                    <button
                      onClick={() => handleDelete(doc)}
                      className="flex items-center justify-center p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 text-right">
          {filtered.length} document{filtered.length !== 1 ? "s" : ""}
          {search ? " found" : " total"}
        </p>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-3 min-w-0">
                {getFileIcon(previewDoc.fileType)}
                <div className="min-w-0">
                  <p
                    className="font-semibold text-gray-800 truncate"
                    title={previewDoc.name}
                  >
                    {previewDoc.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatBytes(previewDoc.fileSize)} &middot; Uploaded by{" "}
                    {previewDoc.uploadedBy}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <a
                  href={previewDoc.downloadURL}
                  download={previewDoc.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium py-1.5 px-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-2 min-h-0">
              {canPreviewInBrowser(previewDoc.fileType) ? (
                previewDoc.fileType.startsWith("image/") ? (
                  <div className="flex items-center justify-center h-full p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewDoc.downloadURL}
                      alt={previewDoc.name}
                      className="max-w-full max-h-[70vh] object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <iframe
                    src={previewDoc.downloadURL}
                    title={previewDoc.name}
                    className="w-full rounded-lg"
                    style={{ height: "70vh" }}
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-64 gap-4 text-center px-6">
                  {getFileIcon(previewDoc.fileType)}
                  <div>
                    <p className="text-gray-700 font-medium">
                      Preview not available for this file type
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Download the file to open it in the appropriate
                      application.
                    </p>
                  </div>
                  <a
                    href={previewDoc.downloadURL}
                    download={previewDoc.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium py-2 px-5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download "{previewDoc.name}"
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
