"use client";

import { motion } from "framer-motion";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/backend/config";
import { ContactSettings } from "@/admin-lib/types";

export default function WhatsAppButton() {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const message = "Hello! I'm interested in your products seen in the website.";

  useEffect(() => {
    loadPhoneNumber();
  }, []);

  const loadPhoneNumber = async () => {
    try {
      const docRef = doc(db, "contact_settings", "global");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const contactInfo = docSnap.data() as ContactSettings;
        if (contactInfo.phoneNumbers && contactInfo.phoneNumbers.length > 0) {
          const primaryPhone = contactInfo.phoneNumbers[0].number;
          let cleanNumber = primaryPhone.replace(/[^0-9+]/g, "");
          
          if (cleanNumber.startsWith("+")) {
            cleanNumber = cleanNumber.substring(1);
          }
          
          if (!cleanNumber.startsWith("94") && cleanNumber.startsWith("0")) {
            cleanNumber = "94" + cleanNumber.substring(1);
          }
          
          setPhoneNumber(cleanNumber);
        }
      }
    } catch (error) {
      console.error("Error loading phone number:", error);
    }
  };

  const handleClick = () => {
    if (!phoneNumber) return;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!phoneNumber) return null;

  return (
    <motion.button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-shadow hover:shadow-xl md:bottom-8 md:right-8 md:h-16 md:w-16"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      aria-label="Contact us on WhatsApp"
    >
      <IconBrandWhatsapp
        className="h-7 w-7 text-white md:h-8 md:w-8"
        stroke={2}
      />
    </motion.button>
  );
}
