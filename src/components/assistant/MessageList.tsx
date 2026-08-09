"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import Suggestions from "./Suggestions";
import type { AssistantMessage } from "@/lib/assistant/types";

interface MessageListProps {
  messages: AssistantMessage[];
  isTyping: boolean;
  isEmpty: boolean;
  onSuggestion: (text: string) => void;
}

export default function MessageList({
  messages,
  isTyping,
  isEmpty,
  onSuggestion,
}: MessageListProps) {
  const t = useTranslations("assistant");
  const endRef = useRef<HTMLDivElement | null>(null);

  // Scroll automático al final cuando entra un mensaje o arranca el typing.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div
      className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
      data-testid="assistant-messages"
    >
      {/* Saludo: parte de la conversación, no una pantalla previa. */}
      <div className="flex justify-start">
        <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-[14.5px] leading-relaxed text-[var(--color-ink)]">
          {t("greeting")}
        </div>
      </div>

      {isEmpty && <Suggestions onSelect={onSuggestion} disabled={isTyping} />}

      {/* aria-live: un lector de pantalla anuncia las respuestas entrantes. */}
      <div aria-live="polite" aria-label={t("conversation")} className="space-y-3">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      <div ref={endRef} />
    </div>
  );
}
