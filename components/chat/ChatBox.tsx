"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { chatResponseSchema } from "@/lib/schemas/chat";

export function ChatBox() {
  const { object, submit, isLoading } = useObject({
    api: "/api/chat",
    schema: chatResponseSchema,
  });

  const handleSend = (text: string) => {
    submit({
      messages: [{ role: "user", content: text }],
      sessionState: { activeSchool: "Bedfordview Primary" },
    });
  };

  return (
    <div className="flex flex-col h-[500px] w-[380px] p-4 bg-white rounded-2xl shadow-xl border border-slate-200">
      {/* Live streaming text appears progressively without JSON parse errors */}
      {object?.reply && (
        <div className="p-3 bg-slate-100 rounded-xl text-sm text-slate-800 leading-relaxed">
          {object.reply}
        </div>
      )}

      {/* Render structured cards once streamed */}
      <div className="flex flex-col gap-2 overflow-y-auto my-2">
        {object?.cards?.map((card) => (
          <div key={card?.id} className="p-3 border border-slate-200 rounded-xl bg-white shadow-xs">
            <h4 className="font-semibold text-sm m-0 text-slate-900">{card?.title}</h4>
            {card?.price && <p className="text-xs font-bold text-teal-700 m-0 mt-0.5">{card.price}</p>}
            <p className="text-xs text-slate-500 m-0 mt-1">{card?.description}</p>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="text-xs text-slate-400 italic py-1">Bro Pex is thinking...</div>
      )}

      {/* Quick-reply action chips */}
      <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-slate-100">
        {object?.quickReplies?.map((chip) => (
          <button
            key={chip?.id}
            onClick={() => chip?.query && handleSend(chip.query)}
            type="button"
            className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-full hover:bg-emerald-100 transition cursor-pointer"
          >
            {chip?.label}
          </button>
        ))}
      </div>
    </div>
  );
}
