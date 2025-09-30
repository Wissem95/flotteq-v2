// 📁 src/components/DatePicker.tsx

import React from "react";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("fr", fr);

interface DatePickerProps {
  /** Valeur au format ISO (YYYY-MM-DD) ou undefined */
  value?: string;
  /** Callback appelé à chaque changement → onChange(date: Date | null) */
  onChange: (date: Date | null) => void;
  /** Texte d’indication dans le champ, par exemple "jj/MM/aaaa" */
  placeholder?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  // Si `value` existe, on le convertit en Date JS, sinon `null`
  const selectedDate = value ? new Date(value) : null;

  return (
    <ReactDatePicker
      selected={selectedDate}
      onChange={onChange}
      dateFormat="dd/MM/yyyy"
      placeholderText={placeholder || "jj/MM/aaaa"}
      locale="fr"
      isClearable
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      todayButton="Aujourd’hui"
      // Vous pouvez ajouter `withPortal` si le calendrier doit s’afficher dans un portal
      withPortal={false}
      className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
};

export default DatePicker;

