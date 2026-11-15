"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import {
  Bold,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  List,
  ListChecks,
  ListOrdered,
  Underline as UnderlineIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichEditor({
  value,
  onChange,
  placeholder = "Escreva seus tópicos de revisão...",
}: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[180px] px-3 py-2 focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  function addImage() {
    const url = window.prompt("URL da imagem");
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-input bg-card">
      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        {[
          {
            icon: Bold,
            action: () => editor.chain().focus().toggleBold().run(),
            active: editor.isActive("bold"),
          },
          {
            icon: Italic,
            action: () => editor.chain().focus().toggleItalic().run(),
            active: editor.isActive("italic"),
          },
          {
            icon: UnderlineIcon,
            action: () => editor.chain().focus().toggleUnderline().run(),
            active: editor.isActive("underline"),
          },
          {
            icon: Heading2,
            action: () =>
              editor.chain().focus().toggleHeading({ level: 2 }).run(),
            active: editor.isActive("heading", { level: 2 }),
          },
          {
            icon: Heading3,
            action: () =>
              editor.chain().focus().toggleHeading({ level: 3 }).run(),
            active: editor.isActive("heading", { level: 3 }),
          },
          {
            icon: List,
            action: () => editor.chain().focus().toggleBulletList().run(),
            active: editor.isActive("bulletList"),
          },
          {
            icon: ListOrdered,
            action: () => editor.chain().focus().toggleOrderedList().run(),
            active: editor.isActive("orderedList"),
          },
          {
            icon: ListChecks,
            action: () => editor.chain().focus().toggleTaskList().run(),
            active: editor.isActive("taskList"),
          },
          { icon: ImageIcon, action: addImage, active: false },
        ].map((btn, i) => (
          <Button
            key={i}
            type="button"
            size="icon"
            variant="ghost"
            className={cn("h-8 w-8", btn.active && "bg-muted")}
            onClick={btn.action}
          >
            <btn.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
