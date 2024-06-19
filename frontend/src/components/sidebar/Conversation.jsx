import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";

const Conversation = ({ conversation, lastIdx, emoji }) => {
	const { selectedConversation, setSelectedConversation } = useConversation();
	const { onlineUsers } = useSocketContext();

	const isSelected = selectedConversation?._id === conversation._id;
	const isOnline = onlineUsers.includes(conversation._id);

	return (
		<>
			<div
				className={`flex gap-2 items-center hover:bg-sky-500 rounded-lg p-1.5 cursor-pointer shadow-md
				${isSelected ? "bg-sky-500" : "bg-white"}
			`}
				onClick={() => setSelectedConversation(conversation)}
			>
				<div className={`avatar ${isOnline ? "online" : ""}`}>
					<div className='w-8 h-8 rounded-full border-2 border-gray-300'>
						<img src={conversation.profilePic} alt='user avatar' />
					</div>
				</div>

				<div className='flex flex-col flex-1'>
					<div className='flex gap-3 justify-between'>
						<p className={`font-bold ${isSelected ? "text-white" : "text-gray-800"}`}>
							{conversation.fullName}
						</p>
						<span className='text-xl'>{emoji}</span>
					</div>
				</div>
			</div>

			{!lastIdx && <div className='border-b border-gray-200 my-1' />}
		</>
	);
};

export default Conversation;
