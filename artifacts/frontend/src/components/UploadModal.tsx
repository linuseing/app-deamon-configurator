import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

export function UploadModal() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.uploadBlueprints(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blueprints"] });
      setIsOpen(false);
      formRef.current?.reset();
      setSelectedFile(null);
    },
  });

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const toggleModal = () => setIsOpen(!isOpen);

  return (
    <>
      <button onClick={toggleModal} className="btn btn-primary btn-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        Upload Blueprints
      </button>

      <dialog ref={dialogRef} className="modal" onClose={() => setIsOpen(false)}>
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">Upload Blueprints</h3>

          <p className="py-2 text-sm text-base-content/70">
            Upload a .zip file containing your blueprints. The file will be unpacked into your configured AppDaemon apps directory.
          </p>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="mt-4 space-y-4"
          >
            <div className="form-control w-full">
              <input
                type="file"
                accept=".zip"
                required
                className="file-input file-input-bordered w-full"
                disabled={uploadMutation.isPending}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>

            {uploadMutation.error && (
              <div className="alert alert-error text-sm py-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{uploadMutation.error.message}</span>
              </div>
            )}

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setIsOpen(false)}
                disabled={uploadMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploadMutation.isPending || !selectedFile}
              >
                {uploadMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
