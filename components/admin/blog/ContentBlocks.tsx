"use client";

import { useMemo, useState } from "react";
import styles from "./content-blocks.module.css";

/**
 * Block composer for blog article content. Each block is a paragraph,
 * heading, bullet list, numbered list, quote, image or call-to-action
 * button. Blocks are stored in the same line-based format the public
 * renderer understands, so existing posts round-trip unchanged.
 */

type Block =
  | { id: number; kind: "text"; value: string; bold: boolean }
  | { id: number; kind: "heading"; value: string }
  | { id: number; kind: "list"; value: string }
  | { id: number; kind: "numbered"; value: string }
  | { id: number; kind: "quote"; value: string }
  | { id: number; kind: "image"; src: string; alt: string; caption: string }
  | { id: number; kind: "button"; label: string; href: string };

const KINDS: { value: Block["kind"]; label: string }[] = [
  { value: "text", label: "Paragraph" },
  { value: "heading", label: "Heading" },
  { value: "list", label: "Bullet list" },
  { value: "numbered", label: "Numbered list" },
  { value: "quote", label: "Quote" },
  { value: "image", label: "Image" },
  { value: "button", label: "Button" },
];

let nextId = 0;

function newBlock(kind: Block["kind"]): Block {
  const id = ++nextId;
  switch (kind) {
    case "image":
      return { id, kind, src: "", alt: "", caption: "" };
    case "button":
      return { id, kind, label: "", href: "" };
    case "text":
      return { id, kind, value: "", bold: false };
    case "heading":
    case "list":
    case "numbered":
    case "quote":
      return { id, kind, value: "" };
  }
}

function textOf(block: Block): string {
  switch (block.kind) {
    case "image":
      return block.alt || block.src;
    case "button":
      return block.label;
    default:
      return block.value;
  }
}

function convert(block: Block, kind: Block["kind"]): Block {
  switch (kind) {
    case "image":
      return { id: block.id, kind, src: "", alt: textOf(block), caption: "" };
    case "button":
      return { id: block.id, kind, label: textOf(block), href: "" };
    case "text":
      return { id: block.id, kind, value: textOf(block), bold: false };
    case "heading":
    case "quote":
    case "list":
    case "numbered":
    default:
      return { id: block.id, kind, value: textOf(block) };
  }
}

function serialize(blocks: Block[]): string[] {
  const lines: string[] = [];
  for (const block of blocks) {
    switch (block.kind) {
      case "text":
        if (block.value.trim()) {
          lines.push(
            block.bold ? `<strong>${block.value}</strong>` : block.value,
          );
        }
        break;
      case "heading":
        if (block.value.trim()) lines.push(`## ${block.value}`);
        break;
      case "list":
      case "numbered": {
        const items = block.value
          .split("\n")
          .map((item) => item.trimEnd())
          .filter((item) => item.trim() !== "");
        for (const item of items)
          lines.push(block.kind === "numbered" ? `1. ${item}` : `- ${item}`);
        break;
      }
      case "quote":
        if (block.value.trim()) lines.push(`> ${block.value}`);
        break;
      case "image":
        if (block.src.trim()) {
          lines.push(`![${block.alt}](${block.src})`);
          if (block.caption.trim()) lines.push(block.caption.trim());
        }
        break;
      case "button":
        if (block.label.trim() && block.href.trim()) {
          lines.push(`[link_pill: ${block.label}|${block.href}]`);
        }
        break;
    }
  }
  return lines;
}

function parse(lines: string[]): Block[] {
  const blocks: Block[] = [];
  let listBlock: {
    id: number;
    kind: "list" | "numbered";
    value: string;
  } | null = null;

  const flushList = () => {
    if (listBlock) {
      blocks.push(listBlock);
      listBlock = null;
    }
  };

  for (const line of lines) {
    const img = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (img) {
      flushList();
      blocks.push({
        id: ++nextId,
        kind: "image",
        src: img[2],
        alt: img[1],
        caption: "",
      });
      continue;
    }

    if (line.startsWith("## ")) {
      flushList();
      blocks.push({
        id: ++nextId,
        kind: "heading",
        value: line.replace("## ", ""),
      });
      continue;
    }

    if (line.startsWith("> ")) {
      flushList();
      blocks.push({
        id: ++nextId,
        kind: "quote",
        value: line.replace("> ", ""),
      });
      continue;
    }

    const pill = line.match(/^\[link_pill:\s*(.*?)\s*\|\s*(.*?)\s*\]$/);
    if (pill) {
      flushList();
      blocks.push({
        id: ++nextId,
        kind: "button",
        label: pill[1],
        href: pill[2],
      });
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.+)/);
    const numbered = line.match(/^\d+[.)]\s+(.+)/);
    if (bullet || numbered) {
      const listKind: "list" | "numbered" =
        numbered !== null ? "numbered" : "list";
      const text = (bullet ?? numbered)![1];
      if (!listBlock || listBlock.kind !== listKind) {
        flushList();
        listBlock = { id: ++nextId, kind: listKind, value: "" };
      }
      listBlock.value = listBlock.value ? `${listBlock.value}\n${text}` : text;
      continue;
    }

    flushList();
    if (line.trim() === "") continue;

    const strong = line.match(/^<strong>\s*([\s\S]*?)\s*<\/strong>$/);
    if (strong) {
      blocks.push({ id: ++nextId, kind: "text", value: strong[1], bold: true });
    } else {
      blocks.push({ id: ++nextId, kind: "text", value: line, bold: false });
    }
  }

  flushList();
  return blocks;
}

function BlockIcon({ kind }: { kind: Block["kind"] }) {
  switch (kind) {
    case "heading":
      return <span aria-hidden="true">H</span>;
    case "list":
      return <span aria-hidden="true">•</span>;
    case "numbered":
      return <span aria-hidden="true">1.</span>;
    case "quote":
      return <span aria-hidden="true">”</span>;
    case "image":
      return <span aria-hidden="true">▦</span>;
    case "button":
      return <span aria-hidden="true">→</span>;
    default:
      return <span aria-hidden="true">¶</span>;
  }
}

export function ContentBlocks({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: string[];
}) {
  const [blocks, setBlocks] = useState<Block[]>(() => parse(defaultValue));
  const serialized = useMemo(() => serialize(blocks).join("\n"), [blocks]);

  const update = (id: number, patch: Partial<Block>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)),
    );
  };

  const move = (index: number, delta: -1 | 1) => {
    setBlocks((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const remove = (id: number) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const setKind = (id: number, kind: Block["kind"]) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? convert(b, kind) : b)));
  };

  const isTextish = (b: Block): b is Extract<Block, { value: string }> =>
    b.kind === "text" || b.kind === "heading" || b.kind === "quote";
  const isList = (
    b: Block,
  ): b is Extract<Block, { kind: "list" | "numbered" }> =>
    b.kind === "list" || b.kind === "numbered";

  return (
    <div className={styles.composer}>
      <input type="hidden" name={name} value={serialized} />
      <ul className={styles.blockList}>
        {blocks.map((block, index) => (
          <li key={block.id} className={styles.block}>
            <div className={styles.blockBar}>
              <span
                className={styles.blockIcon}
                data-db-tooltip={
                  KINDS.find((k) => k.value === block.kind)?.label
                }
              >
                <BlockIcon kind={block.kind} />
              </span>
              <select
                className={styles.kindSelect}
                value={block.kind}
                aria-label="Block type"
                onChange={(e) =>
                  setKind(block.id, e.target.value as Block["kind"])
                }
              >
                {KINDS.map((kind) => (
                  <option key={kind.value} value={kind.value}>
                    {kind.label}
                  </option>
                ))}
              </select>
              <div className={styles.blockActions}>
                <button
                  type="button"
                  className={styles.blockButton}
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={styles.blockButton}
                  aria-label="Move down"
                  disabled={index === blocks.length - 1}
                  onClick={() => move(index, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className={`${styles.blockButton} ${styles.blockButtonDelete}`}
                  aria-label="Delete block"
                  onClick={() => remove(block.id)}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className={styles.blockBody}>
              {isTextish(block) && (
                <>
                  <textarea
                    className={styles.blockTextarea}
                    rows={
                      block.kind === "heading"
                        ? 1
                        : Math.min(
                            6,
                            Math.max(2, block.value.split("\n").length + 1),
                          )
                    }
                    value={block.value}
                    placeholder={
                      block.kind === "heading"
                        ? "Section heading"
                        : block.kind === "quote"
                          ? "Highlighted quote…"
                          : "Write your paragraph…"
                    }
                    onChange={(e) =>
                      update(block.id, { value: e.target.value })
                    }
                  />
                  {block.kind === "text" ? (
                    <label className={styles.boldRow}>
                      <input
                        type="checkbox"
                        checked={block.bold}
                        onChange={(e) =>
                          update(block.id, { bold: e.target.checked })
                        }
                      />
                      <span>Bold paragraph</span>
                    </label>
                  ) : null}
                </>
              )}

              {isList(block) && (
                <textarea
                  className={styles.blockTextarea}
                  rows={Math.min(
                    6,
                    Math.max(2, block.value.split("\n").length + 1),
                  )}
                  value={block.value}
                  placeholder={"One item per line, e.g.\nPencil case\nScissors"}
                  onChange={(e) => update(block.id, { value: e.target.value })}
                />
              )}

              {block.kind === "image" && (
                <div className={styles.imageGrid}>
                  <div className={styles.imageField}>
                    <label className={styles.imageLabel}>Image URL</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={block.src}
                      placeholder="/images/example.webp"
                      onChange={(e) =>
                        update(block.id, { src: e.target.value })
                      }
                    />
                  </div>
                  <div className={styles.imageField}>
                    <label className={styles.imageLabel}>Alt text</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={block.alt}
                      placeholder="What's in the picture"
                      onChange={(e) =>
                        update(block.id, { alt: e.target.value })
                      }
                    />
                  </div>
                  <div className={styles.imageField}>
                    <label className={styles.imageLabel}>
                      Caption (optional)
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      value={block.caption}
                      placeholder="Short caption under the image"
                      onChange={(e) =>
                        update(block.id, { caption: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {block.kind === "button" && (
                <div className={styles.imageGrid}>
                  <div className={styles.imageField}>
                    <label className={styles.imageLabel}>Button label</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={block.label}
                      placeholder="e.g. Find your school pack"
                      onChange={(e) =>
                        update(block.id, { label: e.target.value })
                      }
                    />
                  </div>
                  <div className={styles.imageField}>
                    <label className={styles.imageLabel}>Link</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={block.href}
                      placeholder="/schools or https://…"
                      onChange={(e) =>
                        update(block.id, { href: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={styles.addBlock}
        onClick={() => setBlocks((prev) => [...prev, newBlock("text")])}
      >
        <span aria-hidden="true">+</span> Add block
      </button>
    </div>
  );
}
