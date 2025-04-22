import { motion } from "framer-motion";
import { Shield, UserPlus } from "lucide-react";
import { WorkspaceUsersList } from "@/components/workspace/workspace-users-list";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Members({ activeWorkspace }) {
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Animaciones para los elementos
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-xl"
      >
        <div className="relative pb-4 space-y-6">
          <WorkspaceUsersList workspaceId={activeWorkspace?.id} />
        </div>
      </motion.div>
    </motion.div>
  );
}
