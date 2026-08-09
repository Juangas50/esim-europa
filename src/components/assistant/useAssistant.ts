"use client";

import { useCallback, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createAssistantTransport } from "@/lib/assistant/transport";
import { trackAssistantMessageSent } from "@/lib/assistant/telemetry";
import type { AssistantMessage } from "@/lib/assistant/types";

/**
 * Estado de la conversación.
 *
 * El motor devuelve claves de traducción; aquí se resuelven a texto. Así el
 * copy vive íntegramente en `messages/*.json` y el motor no sabe de idiomas.
 */
export function useAssistant() {
  const t = useTranslations("assistant");
  const locale = useLocale();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const transportRef = useRef(createAssistantTransport());
  const idRef = useRef(0);
  const nextId = () => `m${++idRef.current}`;

  // Espejo del historial. El updater de `setMessages` no sirve para leer estado
  // (React puede reinvocarlo), así que el snapshot que consume el motor sale de
  // aquí y la escritura se hace junto al `setState` correspondiente.
  const historyRef = useRef<AssistantMessage[]>([]);
  const commit = useCallback((next: AssistantMessage[]) => {
    historyRef.current = next;
    setMessages(next);
  }, []);

  const send = useCallback(
    async (raw: string) => {
      const input = raw.trim();
      if (!input || isTyping) return;

      // Snapshot del historial ANTES de añadir el turno nuevo: el motor decide
      // el siguiente paso a partir de lo que ya se dijo.
      const history = historyRef.current;
      const userMessage: AssistantMessage = { id: nextId(), role: "user", content: input };
      commit([...history, userMessage]);

      trackAssistantMessageSent({ turn: history.length + 1 });
      setIsTyping(true);

      try {
        const reply = await transportRef.current.send({ input, history, locale });
        commit([
          ...historyRef.current,
          {
            id: nextId(),
            role: "assistant",
            content: t(`replies.${reply.replyKey}`),
            actions: reply.actions,
            intent: reply.intent,
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [commit, isTyping, locale, t]
  );

  return {
    messages,
    isTyping,
    send,
    /** El saludo y las sugerencias solo se muestran antes del primer turno. */
    isEmpty: messages.length === 0,
  };
}
