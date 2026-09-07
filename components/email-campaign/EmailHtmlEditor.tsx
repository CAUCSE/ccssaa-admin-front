"use client"

import { useEffect } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableHeader from "@tiptap/extension-table-header"
import TableCell from "@tiptap/extension-table-cell"
import { Bold, Italic, Link2, List, ListOrdered, Redo2, Table2, Undo2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Props { value: string; onChange: (html: string, text: string) => void; error?: string; disabled?: boolean }

export function EmailHtmlEditor({ value, onChange, error, disabled }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [StarterKit, Link.configure({ openOnClick: false, protocols: ["https"] }), Image.configure({ allowBase64: false }), Table.configure({ resizable: true }), TableRow, TableHeader, TableCell],
    content: value,
    editorProps: { attributes: { class: "min-h-[300px] px-4 py-3 text-sm outline-none prose prose-sm max-w-none" } },
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML(), instance.getText()),
  })

  useEffect(() => { editor?.setEditable(!disabled) }, [disabled, editor])
  const addLink = () => { const url = window.prompt("HTTPS 링크를 입력하세요."); if (url?.startsWith("https://")) editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run() }
  const addImage = () => { const src = window.prompt("HTTPS 이미지 주소를 입력하세요."); if (src?.startsWith("https://")) editor?.chain().focus().setImage({ src }).run() }
  const tool = (label: string, active: boolean, action: () => void, icon: React.ReactNode) => <Button type="button" variant={active ? "default" : "outline"} size="sm" aria-label={label} title={label} onClick={action} disabled={disabled}>{icon}</Button>

  return <div className={cn("overflow-hidden rounded-md border bg-background", error && "border-destructive")}>
    <div className="flex flex-wrap gap-1 border-b bg-muted/40 p-2">
      {tool("실행 취소", false, () => editor?.chain().focus().undo().run(), <Undo2 className="h-4 w-4"/>)}
      {tool("다시 실행", false, () => editor?.chain().focus().redo().run(), <Redo2 className="h-4 w-4"/>)}
      {tool("굵게", !!editor?.isActive("bold"), () => editor?.chain().focus().toggleBold().run(), <Bold className="h-4 w-4"/>)}
      {tool("기울임", !!editor?.isActive("italic"), () => editor?.chain().focus().toggleItalic().run(), <Italic className="h-4 w-4"/>)}
      {tool("글머리 목록", !!editor?.isActive("bulletList"), () => editor?.chain().focus().toggleBulletList().run(), <List className="h-4 w-4"/>)}
      {tool("번호 목록", !!editor?.isActive("orderedList"), () => editor?.chain().focus().toggleOrderedList().run(), <ListOrdered className="h-4 w-4"/>)}
      {tool("링크", !!editor?.isActive("link"), addLink, <Link2 className="h-4 w-4"/>)}
      {tool("이미지", false, addImage, <ImageIcon className="h-4 w-4"/>)}
      {tool("표", !!editor?.isActive("table"), () => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), <Table2 className="h-4 w-4"/>)}
    </div>
    <EditorContent editor={editor}/>
  </div>
}
