export default function Ticker() {
  const updates = [
    "Skill Census registration open till Oct 15",
    "MoU signed with Ceremorphic",
    "EITP CRT Week starts on Oct 20 - Register Now!",
    "New Internship Opportunities available at NXP Semiconductors"
  ];

  return (
    <div className="bg-eitp-primary text-white text-sm py-2 overflow-hidden relative flex items-center">
      <div className="bg-eitp-accent text-eitp-primary px-4 py-1 font-bold z-10 absolute left-0 h-full flex items-center shadow-lg">
        LATEST UPDATES
      </div>
      <div className="whitespace-nowrap animate-marquee flex space-x-8 pl-40">
        {updates.map((update, idx) => (
          <span key={idx} className="mx-4 flex items-center">
            <span className="w-2 h-2 bg-eitp-accent rounded-full mr-2"></span>
            {update}
          </span>
        ))}
      </div>
      {/* Add this keyframe to global css for animation: @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } } */}
    </div>
  );
}
