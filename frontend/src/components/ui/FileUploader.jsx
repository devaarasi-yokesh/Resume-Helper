import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import React from "react";

export default function FileUploader({ label, file, setFile, setUploadHistory }) {
  const onDrop = (acceptedFiles) => {
    const newFile = acceptedFiles[0];
    if (!newFile) return;

    // Validate file type
    if (
      ![
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(newFile.type)
    ) {
      alert("Only PDF or DOCX files are allowed");
      return;
    }

    setFile(newFile);

    // Save to history
    const reader = new FileReader();
    reader.onload = () => {
      const history = JSON.parse(localStorage.getItem("uploadHistory")) || [];
      const newEntry = {
        name: newFile.name,
        type: newFile.type,
        date: new Date().toLocaleString(),
      };
      const updatedHistory = [newEntry, ...history];
      setUploadHistory(updatedHistory);
      localStorage.setItem("uploadHistory", JSON.stringify(updatedHistory));

      document.querySelector('input[type="file"]').value = ""; // reset input
    };
    reader.readAsDataURL(newFile);
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed rounded-xl p-6 text-center transition-colors flex flex-col items-center justify-center gap-3"
      style={{
        borderColor: isDragActive
          ? "var(--color-primary)"
          : "var(--color-border)",
        backgroundColor: isDragActive
          ? "var(--color-accent-muted)"
          : "var(--color-card)",
        cursor: "pointer",
      }}
    >
      <input {...getInputProps()} />

      {file ? (
        <p className="text-sm font-medium text-foreground">📄 {file.name}</p>
      ) : (
        <div className="flex flex-col items-center gap-2">
          {/* Icon with bottom margin for breathing space */}
          <Upload size={28} className="text-muted-foreground mb-1" />
          
          {/* Label text */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            Drag & drop your <span className="font-semibold">{label}</span>
          </p>
          
          {/* Action button with tighter spacing */}
          <button
            type="button"
            onClick={open}
            className="mt-2 px-4 py-2 text-sm font-medium text-primary underline hover:opacity-80"
          >
            Click to browse
          </button>
        </div>
      )}
    </div>
  );
}
