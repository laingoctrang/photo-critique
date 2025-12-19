import React from "react";
import { Modal } from "../../components";

interface UnfollowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const UnfollowModal: React.FC<UnfollowModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Unfollow"
      message="Are you sure you want to unfollow this user?"
      confirmText="Unfollow"
      cancelText="Cancel"
      onConfirm={onConfirm}
      variant="danger"
      showCancel={true}
    />
  );
};

