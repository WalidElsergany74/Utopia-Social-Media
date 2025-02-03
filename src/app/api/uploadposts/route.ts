import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

// Define the type for the form data file
type FormDataFile = Blob & {
  name?: string; // Optional: Some browsers may add this
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as FormDataFile | null;
    const pathName = formData.get("pathName") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert the file to a format Cloudinary can handle (Buffer or Base64)
    const fileBuffer = await file.arrayBuffer();
    const base64File = Buffer.from(fileBuffer).toString("base64");

    // Define transformations to ensure the image quality is preserved
    const transformations = [
      { quality: "auto", fetch_format: "auto" }, // Ensures highest quality and auto format selection
      { width: 2000, height: 2000, crop: "limit" }, // Limits the size to a maximum of 2000x2000px to avoid huge images
    ];

    // Upload to Cloudinary with transformations
    const uploadResponse = await cloudinary.uploader.upload(
      `data:${file.type};base64,${base64File}`,
      {
        folder: pathName,
        transformation: transformations, // Apply the transformations
      }
    );
    
    return NextResponse.json({ url: uploadResponse.secure_url });
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
