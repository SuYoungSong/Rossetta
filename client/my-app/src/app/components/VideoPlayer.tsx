import React from "react";
import "@/app/styles/situation_num.css"

interface VideoProps {
    src_url: string | string[];
    count?: number;
}

const VideoPlayer: React.FC<VideoProps> = ({src_url, count}) => {

  return (
    <>
        <div className="outer">
            <video controls className="video" src={src_url[count ?? 0]}></video>
        </div>
    </>
  );
};

export default VideoPlayer;