"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import styles from "./OrderPage.module.css";


type OrderCategory = "Pre-School" | "Primary" | "High School" | "Office";

function formatPhoneSA(value: string) {
  const hasPlus = value.startsWith('+');
  const digits = value.replace(/\D/g, "");
  
  if (hasPlus && digits.startsWith("27")) {
    const rest = digits.slice(2);
    if (rest.length <= 2) return `+27 ${rest}`;
    if (rest.length <= 5) return `+27 ${rest.slice(0, 2)} ${rest.slice(2)}`;
    return `+27 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 9)}`;
  } else if (digits.startsWith("0")) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  }
  
  return value;
}

export function OrderForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<OrderCategory | null>(null);
  
  const [inputMethod, setInputMethod] = useState<"upload" | "type">("upload");
  const [fileName, setFileName] = useState<string | null>(null);
  const [listText, setListText] = useState("");
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setPhone(formatPhoneSA(rawValue));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
      if (errors.list) setErrors((prev) => ({ ...prev, list: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!phone.replace(/[^0-9+]/g, "")) newErrors.phone = "WhatsApp number is required";
    if (!category) newErrors.category = "Please select a category";
    
    if (inputMethod === "upload" && !fileName) {
      newErrors.list = "Please upload your list or switch to typing it out";
    }
    if (inputMethod === "type" && !listText.trim()) {
      newErrors.list = "Please paste or type your list";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // In a real app, we would send `name, email, phone, category, listText / file` to the backend
    console.log("Form submitted", { name, email, phone, category, listText, fileName });
    
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className={`${styles.formCard} ${styles.successState}`}>
        <div className={styles.successIcon}>✓</div>
        <h2>List Received!</h2>
        <p>
          Thanks {name.split(" ")[0]}! We have received your stationery list.
          <br /><br />
          Our packing team is reviewing it now and will send your custom quote to <strong>{phone}</strong> via WhatsApp shortly.
        </p>
        <Button 
          variant="outline" 
          onClick={() => {
            setIsSuccess(false);
            setFileName(null);
            setListText("");
          }}
          style={{ marginTop: "32px" }}
        >
          Submit another list
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.formCard}>
      <form onSubmit={handleSubmit} className={styles.formGrid}>
        
        {/* Category Selection */}
        <div className={styles.field}>
          <label>1. Who are you ordering for?</label>
          <div className={styles.categoryPills}>
            {(["Pre-School", "Primary", "High School", "Office"] as OrderCategory[]).map((cat) => (
              <div 
                key={cat}
                className={`${styles.categoryPill} ${category === cat ? styles.active : ""}`}
                onClick={() => {
                  setCategory(cat);
                  if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
                }}
              >
                {cat}
              </div>
            ))}
          </div>
          {errors.category && <span className={styles.errorText}>{errors.category}</span>}
        </div>

        {/* List Input */}
        <div className={styles.field}>
          <label>2. Share your stationery list</label>
          <div className={styles.tabs}>
            <button 
              type="button"
              className={`${styles.tab} ${inputMethod === "upload" ? styles.active : ""}`}
              onClick={() => setInputMethod("upload")}
            >
              Upload Photo/PDF
            </button>
            <button 
              type="button"
              className={`${styles.tab} ${inputMethod === "type" ? styles.active : ""}`}
              onClick={() => setInputMethod("type")}
            >
              Paste / Type List
            </button>
          </div>

          {inputMethod === "upload" ? (
            fileName ? (
              <div className={styles.successArea}>
                <div className={styles.successIcon} style={{ width: 32, height: 32, fontSize: 16 }}>✓</div>
                <strong>{fileName}</strong>
                <button 
                  type="button" 
                  onClick={() => setFileName(null)}
                  style={{ display: "block", margin: "8px auto 0", background: "none", border: "none", color: "var(--pex-coral)", textDecoration: "underline", cursor: "pointer" }}
                >
                  Remove file
                </button>
              </div>
            ) : (
              <div 
                className={`${styles.uploadArea} ${isDragging ? styles.dragging : ""}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setFileName(e.dataTransfer.files[0].name);
                    if (errors.list) setErrors((prev) => ({ ...prev, list: "" }));
                  }
                }}
              >
                <div className={styles.uploadIcon}>📄</div>
                <strong>Click to upload or drag and drop</strong>
                <span>PNG, JPG, PDF (Max. 5MB)</span>
                <input 
                  type="file" 
                  className={styles.fileInput} 
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, application/pdf"
                />
              </div>
            )
          ) : (
            <textarea
              className={`${styles.input} ${errors.list ? styles.inputError : ""}`}
              placeholder="Paste your items here (e.g. 5x HB Pencils, 2x Pritt 43g...)"
              rows={4}
              value={listText}
              onChange={(e) => {
                setListText(e.target.value);
                if (errors.list) setErrors((prev) => ({ ...prev, list: "" }));
              }}
            />
          )}
          {errors.list && <span className={styles.errorText}>{errors.list}</span>}
        </div>

        {/* Contact Details */}
        <div className={styles.field} style={{ marginTop: "8px" }}>
          <label>3. Where should we send your quote?</label>
          
          <input
            type="text"
            className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
            placeholder="Your Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
          />
          {errors.name && <span className={styles.errorText}>{errors.name}</span>}

          <input
            type="tel"
            className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
            placeholder="WhatsApp Number (e.g. 078 123 4567)"
            value={phone}
            onChange={handlePhoneChange}
          />
          {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}

          <input
            type="email"
            className={styles.input}
            placeholder="Email Address (Optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button 
          type="submit" 
          variant="primary" 
          size="lg" 
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Get Custom Quote"}
        </Button>
      </form>
    </div>
  );
}
