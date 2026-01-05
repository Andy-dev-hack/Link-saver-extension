import SyncButton from './SyncButton';

export default function InputSection({ inputVal, setInputVal, onSaveLink, onSaveTab }) {
    return (
        <div className="flex flex-col gap-3 pb-3 mb-3 border-b border-[#484848]">
            {/* Row 1: Input and Save Link */}
            <div className="flex gap-2 w-full">
                <input 
                    type="text" 
                    className="p-2 border border-neon-blue rounded-[5px] grow min-w-[50px] bg-dark-card text-text-main transition-all duration-300 placeholder-[#aaa]"
                    placeholder="Enter a link"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                />
                <button 
                    className="bg-neon-blue text-white border-none rounded-[5px] px-[15px] py-2 cursor-pointer font-bold flex-none transition-all duration-200 hover:bg-neon-blue-hover hover:scale-105" 
                    onClick={onSaveLink}
                >
                    Save Link
                </button>
            </div>

            {/* Row 2: Save Tab and Sync Tabs */}
            <div className="flex gap-2 w-full">
                <button 
                    className="bg-neon-blue text-white border-none rounded-[5px] px-[15px] py-3 cursor-pointer font-bold flex-1 transition-all duration-200 hover:bg-neon-blue-hover hover:scale-105" 
                    onClick={onSaveTab}
                >
                    Save Tab
                </button>
                <SyncButton className="flex-1" />
            </div>
        </div>
    );
}
