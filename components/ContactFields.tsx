"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"

interface ContactFieldsProps {
  form: UseFormReturn<any>
}

export function ContactFields({ form }: ContactFieldsProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <Label htmlFor="name" className="text-sm sm:text-base">Name *</Label>
        <Input
          id="name"
          {...form.register("contact.name")}
          placeholder="Max Mustermann"
        />
        {form.formState.errors.contact && 'name' in form.formState.errors.contact && (
          <p className="text-xs sm:text-sm text-destructive mt-1">
            {(form.formState.errors.contact.name as any)?.message as string}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="email" className="text-sm sm:text-base">E-Mail *</Label>
        <Input
          id="email"
          type="email"
          {...form.register("contact.email")}
          placeholder="max@example.com"
        />
        {form.formState.errors.contact && 'email' in form.formState.errors.contact && (
          <p className="text-xs sm:text-sm text-destructive mt-1">
            {(form.formState.errors.contact.email as any)?.message as string}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="phone" className="text-sm sm:text-base">Telefon *</Label>
        <Input
          id="phone"
          type="tel"
          {...form.register("contact.phone")}
          placeholder="+49 123 456789"
        />
        {form.formState.errors.contact && 'phone' in form.formState.errors.contact && (
          <p className="text-xs sm:text-sm text-destructive mt-1">
            {(form.formState.errors.contact.phone as any)?.message as string}
          </p>
        )}
      </div>
      
      <div className="pt-3 sm:pt-4 border-t">
          <Label htmlFor="preferredContactMethod" className="mb-2 sm:mb-3 block text-sm sm:text-base">Wie möchten Sie kontaktiert werden? *</Label>
        <Select
          value={form.watch("contact.preferredContactMethod") || ""}
          onValueChange={(value) => form.setValue("contact.preferredContactMethod", value as any)}
        >
          <SelectTrigger id="preferredContactMethod">
            <SelectValue placeholder="Kontaktmethode wählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="whatsapp">📱 WhatsApp</SelectItem>
            <SelectItem value="telefon">📞 Telefon</SelectItem>
            <SelectItem value="email">✉️ E-Mail</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.contact && 'preferredContactMethod' in form.formState.errors.contact && (
          <p className="text-xs sm:text-sm text-destructive mt-1">
            {(form.formState.errors.contact.preferredContactMethod as any)?.message as string}
          </p>
        )}
      </div>
    </div>
  )
}

