import { ChangeEvent, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "./LoadingSpinner";

interface FileUploadProps {
	onFileUpload: (file: File) => Promise<void>;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
	const [isLoading, setIsLoading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setIsLoading(true);
			try {
				await onFileUpload(file);
			} finally {
				setIsLoading(false);
			}
		}
	};

	const handleButtonClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className="mb-4">
			<input
				type="file"
				accept=".csv"
				onChange={handleFileChange}
				className="hidden"
				ref={fileInputRef}
				disabled={isLoading}
			/>
			<Button onClick={handleButtonClick} variant="outline" disabled={isLoading}>
				{isLoading ? <LoadingSpinner /> : "Upload CSV"}
			</Button>
			{isLoading && <span className="ml-2">Processing file...</span>}
		</div>
	);
}
