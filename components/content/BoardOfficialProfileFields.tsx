"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStorageImageSrc } from "@/hooks/useStorageImageSrc"

interface BoardOfficialProfileFieldsProps {
  officialNickname: string
  previewUrl: string | null
  selectedFileName?: string
  inputIdPrefix: string
  disabled?: boolean
  onNicknameChange: (value: string) => void
  onFileChange: (file: File | null) => void
}

export function BoardOfficialProfileFields({
  officialNickname,
  previewUrl,
  selectedFileName,
  inputIdPrefix,
  disabled = false,
  onNicknameChange,
  onFileChange,
}: BoardOfficialProfileFieldsProps) {
  const fileInputId = `${inputIdPrefix}-official-profile-image`
  const { src: imageSrc, isLoading: isImageLoading } = useStorageImageSrc(previewUrl)

  return (
    <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
      <div>
        <h3 className="text-sm font-medium">공지글 마스킹 설정</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          공지글 작성자 대신 표시할 게시판 공식 닉네임과 프로필 이미지를 설정합니다.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${inputIdPrefix}-official-nickname`}>공식 닉네임</Label>
        <Input
          id={`${inputIdPrefix}-official-nickname`}
          value={officialNickname}
          onChange={(e) => onNicknameChange(e.target.value)}
          placeholder="예: 소프트웨어학부 학생회"
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          미입력 시 백엔드 기본값인 “게시판 관리자”가 사용됩니다.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={fileInputId}>공식 프로필 이미지</Label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border bg-background text-xs text-muted-foreground">
            {imageSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageSrc}
                alt="공식 프로필 이미지 미리보기"
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{isImageLoading ? "로딩…" : previewUrl ? "미리보기 불가" : "Preview"}</span>
            )}
          </div>
          <div className="flex-1 space-y-1">
            <Input
              id={fileInputId}
              type="file"
              accept="image/*"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              {selectedFileName
                ? `선택된 파일: ${selectedFileName}`
                : "새 이미지를 선택하면 저장 전에 먼저 업로드됩니다."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
