import json,subprocess,sys,os
MODE=sys.argv[1];FR=f"/tmp/qa9/frames_{MODE}"
W,H,COVER=(1920,1080,"/tmp/qa9/covers/cover-landscape-1920x1080.png") if MODE=="land" else (1080,1620,"/tmp/qa9/covers/cover-portrait-video.png")
ts=json.load(open(f"{FR}/meta.json"));n=len(ts)
lines=[]
for i in range(n):
    d=(ts[i+1]-ts[i]) if i+1<n else 0.4
    lines+= [f"file '{FR}/{i:05d}.jpg'",f"duration {max(d,0.001):.4f}"]
lines.append(f"file '{FR}/{n-1:05d}.jpg'")
open(f"{FR}/list.txt","w").write("\n".join(lines))
game=f"/tmp/qa9/game_{MODE}.mp4"
subprocess.run(["ffmpeg","-y","-loglevel","error","-f","concat","-safe","0","-i",f"{FR}/list.txt","-vf",f"scale={W}:{H}:flags=neighbor,fps=30,format=yuv420p","-c:v","libx264","-preset","veryfast","-crf","18","-an",game],check=True)
cov=1.7;xf=0.35
out=f"/tmp/qa9/covers/frutodromo-preview-{MODE}-{W}x{H}.mp4"
subprocess.run(["ffmpeg","-y","-loglevel","error","-loop","1","-t",str(cov+xf),"-i",COVER,"-i",game,
  "-filter_complex",f"[0:v]scale={W}:{H},fps=30,format=yuv420p,settb=1/30,setsar=1[c];[1:v]fps=30,settb=1/30,setsar=1[g];[c][g]xfade=transition=fade:duration={xf}:offset={cov}[v]",
  "-map","[v]","-c:v","libx264","-preset","veryfast","-crf","18","-pix_fmt","yuv420p","-movflags","+faststart","-an",out],check=True)
d=subprocess.run(["ffprobe","-v","error","-show_entries","format=duration:stream=width,height","-of","json",out],capture_output=True,text=True).stdout
print(out,d.replace("\n",""),os.path.getsize(out)//1024,"KB")
