"use client"
import VideoPlayer from "@/app/components/VideoPlayer";
import React from "react";
import {useSearchParams} from "next/navigation";

export default function TextMemory() {
    const urls = ["http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"]


    const searchParams = useSearchParams()

    const type = searchParams.get('type')
    const situation = searchParams.get('situation')
    const chapter = searchParams.get('chapter')

    return (
      <>
        <div>문자 암기 페이지</div>
        {/*<VideoPlayer/>*/}
      </>
    );
    
  }