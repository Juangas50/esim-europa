"use client";

import { motion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";
import MessageActions from "./MessageActions";
import type { AssistantMessage } from "@/lib/assistant/types";

interface MessageBubbleProps {
  message: AssistantMessage;
}

/**
 * Una burbuja de conversación.
 *
 * No conoce ninguna acción concreta: si el mensaje trae `actions`, las delega en
 * `MessageActions`. Añadir acciones nuevas no toca este archivo.
 */
export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      className={isUser ? "flex justify-end" : "flex justify-start"}
      data-testid={isUser ? "message-user" : "message-assistant"}
    >
      <div className={isUser ? "max-w-[85%]" : "max-w-[92%]"}>
        <div
          className={
            isUser
              ? "rounded-2xl rounded-br-md bg-[var(--color-navy)] px-3.5 py-2.5 text-[14.5px] leading-relaxed text-white"
              : "rounded-2xl rounded-bl-md border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-[14.5px] leading-relaxed text-[var(--color-ink)]"
          }
        >
          {message.content}
        </div>

        {!isUser && message.actions && message.actions.length > 0 && (
          <MessageActions actions={message.actions} intent={message.intent} />
        )}
      </div>
    </motion.div>
  );
}
