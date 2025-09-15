"use client"

import { useState, useCallback, memo } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Maximize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Video from "next-video"

interface VideoPlayerModalProps {
    isOpen: boolean
    onClose: () => void
    videoSrc: string
    title?: string
    poster?: string
}

const VideoPlayerModal = memo(function VideoPlayerModal({
    isOpen,
    onClose,
    videoSrc,
    title,
    poster
}: VideoPlayerModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-6xl w-full h-[90vh] p-0 gap-0 bg-black border-0 overflow-hidden"
                showCloseButton={false}
            >
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70 border border-white/20"
                        onClick={onClose}
                    >
                        <X className="h-5 w-5" />
                    </Button>

                    {title && (
                        <div className="absolute top-4 left-4 z-50 text-white">
                            <h3 className="text-lg font-semibold bg-black/50 px-3 py-1 rounded-md backdrop-blur-sm border border-white/20">
                                {title}
                            </h3>
                        </div>
                    )}

                    <div className="w-full h-full flex items-center justify-center">
                        <Video
                            src={videoSrc}
                            poster={poster}
                            controls
                            autoPlay
                            className="w-full h-full object-contain"
                            style={VIDEO_STYLE}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
})

interface VideoPlayerThumbnailProps {
    videoSrc: string
    poster?: string
    title?: string
    className?: string
    children?: React.ReactNode
    onVideoClick?: () => void
}

const VIDEO_STYLE = { maxHeight: '100%', maxWidth: '100%' } as const

const THUMBNAIL_BASE_CLASSES = "relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl"
const OVERLAY_CLASSES = "absolute inset-0 bg-black/20 flex items-center justify-center transition-all duration-300 rounded-2xl"
const EXPAND_ICON_CLASSES = "absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white transition-all duration-300 backdrop-blur-sm border border-white/20"

export function VideoPlayerThumbnail({
    videoSrc,
    poster,
    title,
    className,
    children,
    onVideoClick
}: VideoPlayerThumbnailProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    const handleClick = useCallback(() => {
        onVideoClick?.()
        setIsModalOpen(true)
    }, [onVideoClick])

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false)
    }, [])

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true)
    }, [])

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false)
    }, [])

    return (
        <>
            <div
                className={cn(THUMBNAIL_BASE_CLASSES, className)}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {children}

                <div className={cn(
                    OVERLAY_CLASSES,
                    isHovered ? "opacity-100" : "opacity-0"
                )} />

                <div className={cn(
                    EXPAND_ICON_CLASSES,
                    isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
                )}>
                    <Maximize2 className="h-4 w-4" />
                </div>
            </div>

            <VideoPlayerModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                videoSrc={videoSrc}
                title={title}
                poster={poster}
            />
        </>
    )
}