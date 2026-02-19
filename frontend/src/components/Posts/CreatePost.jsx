import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import {
  FaImage,
  FaSmile,
  FaMapMarkerAlt,
  FaTimes,
} from "react-icons/fa"; 
import { useAuth } from "../../context/AuthContext";
import { postsAPI } from "../../services/api";

const CreatePost = ({ onPostCreated, isModal = false, onClose }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [location, setLocation] = useState("");
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const { user } = useAuth();
  const textareaRef = useRef(null);
  const modalRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const MAX_CHARS = 280;

  
  const emojis = ['😊', '😂', '❤️', '👍', '🔥', '🎉', '😢', '😡', '😍', '🥳', '😎', '💯'];

  const handleCloseModal = useCallback(() => {
    setContent("");
    setCharCount(0);
    removeImage();
    setError("");
    setLocation("");
    setShowLocationInput(false);
    setShowEmojiPicker(false);
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (!isModal) return;

    if (textareaRef.current) {
      textareaRef.current.focus();
    }

   
    const handleEscape = (e) => {
      if (e.key === "Escape" && onClose) {
        handleCloseModal();
      }
    };

   
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        handleCloseModal();
      }
    };

   
    const handleClickOutsideEmoji = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };

  
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("mousedown", handleClickOutsideEmoji);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("mousedown", handleClickOutsideEmoji);

      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    };
  }, [isModal, onClose, handleCloseModal]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("A imagem deve ter no máximo 5MB");
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleContentChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setContent(value);
      setCharCount(value.length);
    }
  };

  const addEmoji = (emoji) => {
    setContent(prev => prev + emoji);
    setCharCount(prev => prev + emoji.length);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) {
      setError("Escreva algo ou adicione uma imagem para tweetar");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const postData = {
        content: content.trim(),
        image: image,
        location: location.trim() || undefined
      };

      await postsAPI.createPost(postData);
      
      setContent("");
      setCharCount(0);
      removeImage();
      setLocation("");
      setShowLocationInput(false);
      setShowEmojiPicker(false);

      if (onPostCreated) {
        onPostCreated();
      }

      if (isModal && onClose) {
        setTimeout(() => onClose(), 300);
      }
    } catch (err) {
      setError("Erro ao criar tweet. Tente novamente.");
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

 
  if (!isModal) {
    return (
      <div className="card p-4 mb-4 bg-white rounded-xl shadow-sm">
        {error && (
          <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <div className="flex space-x-4">
          <img
            src={user?.profile_picture || "/default-avatar.png"}
            alt={user?.username}
            className="w-12 h-12 rounded-full flex-shrink-0 object-cover"
            onError={(e) => {
              e.target.src = '/default-avatar.png';
            }}
          />

          <form onSubmit={handleSubmit} className="flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              placeholder="O que está acontecendo?"
              className="w-full p-3 text-lg border-none focus:outline-none resize-none placeholder-gray-500"
              rows="3"
              disabled={loading}
              maxLength={MAX_CHARS}
            />

            {/* Preview da imagem */}
            {imagePreview && (
              <div className="relative mt-3 mb-3">
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 z-10"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full rounded-2xl max-h-96 object-cover"
                />
              </div>
            )}

            {/* Localização */}
            {showLocationInput && (
              <div className="mb-3 flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                <FaMapMarkerAlt className="text-twitter-blue flex-shrink-0" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Adicionar localização"
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => {
                    setLocation("");
                    setShowLocationInput(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div 
                ref={emojiPickerRef}
                className="mb-3 p-2 border border-gray-200 rounded-lg bg-white shadow-lg"
              >
                <div className="flex flex-wrap gap-2">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => addEmoji(emoji)}
                      className="text-2xl hover:bg-gray-100 p-1 rounded transition-colors"
                      disabled={loading}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Contador de caracteres */}
            <div className="flex justify-end items-center mb-3">
              <div
                className={`text-sm ${charCount > MAX_CHARS * 0.9 ? "text-red-500" : "text-gray-500"}`}
              >
                {charCount}/{MAX_CHARS}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <div className="flex space-x-4">
                <label className="cursor-pointer text-twitter-blue hover:text-twitter-darkBlue transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={loading}
                  />
                  <FaImage className="h-5 w-5" />
                </label>
                
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-twitter-blue hover:text-twitter-darkBlue transition-colors"
                  disabled={loading}
                >
                  <FaSmile className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowLocationInput(!showLocationInput)}
                  className="text-twitter-blue hover:text-twitter-darkBlue transition-colors"
                  disabled={loading}
                >
                  <FaMapMarkerAlt className="h-5 w-5" />
                </button>

                {/* 👇 BOTÃO DO CALENDÁRIO REMOVIDO */}
              </div>

              <button
                type="submit"
                disabled={(!content.trim() && !image) || loading || charCount > MAX_CHARS}
                className="bg-twitter-blue hover:bg-twitter-darkBlue text-white font-bold py-2 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Tweetando...
                  </span>
                ) : (
                  "Tweetar"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Versão Modal com as novas funcionalidades
  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.95)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 2147483647,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={handleCloseModal}
    >
      <div
        ref={modalRef}
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflow: "hidden",
          zIndex: 2147483647,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem",
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "white",
          }}
        >
          <button
            onClick={handleCloseModal}
            style={{
              padding: "0.5rem",
              borderRadius: "9999px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f3f4f6")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
            aria-label="Fechar"
          >
            <FaTimes
              style={{ width: "1.5rem", height: "1.5rem", color: "#4b5563" }}
            />
          </button>

          <button
            onClick={handleSubmit}
            disabled={(!content.trim() && !image) || loading || charCount > MAX_CHARS}
            style={{
              backgroundColor: "#000000",
              color: "white",
              fontWeight: "bold",
              padding: "0.5rem 1.5rem",
              borderRadius: "9999px",
              transition: "all 0.2s",
              opacity: (!content.trim() && !image) || loading || charCount > MAX_CHARS ? 0.5 : 1,
              cursor: (!content.trim() && !image) || loading || charCount > MAX_CHARS ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = "#1f2937";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = "#000000";
              }
            }}
          >
            {loading ? "Tweetando..." : "Tweetar"}
          </button>
        </div>

        {/* Conteúdo */}
        <div
          style={{
            padding: "1rem",
            overflowY: "auto",
            maxHeight: "calc(90vh - 80px)",
          }}
        >
          {error && (
            <div
              style={{
                marginBottom: "1rem",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                padding: "0.75rem 1rem",
                borderRadius: "0.5rem",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "1rem" }}>
            <img
              src={user?.profile_picture || "/default-avatar.png"}
              alt={user?.username}
              style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "9999px",
                flexShrink: 0,
                objectFit: "cover",
              }}
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
            />

            <form onSubmit={handleSubmit} style={{ flex: 1 }}>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                placeholder="O que está acontecendo?"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  fontSize: "1.25rem",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  backgroundColor: "transparent",
                  minHeight: "120px",
                  fontFamily: "inherit",
                }}
                rows={4}
                disabled={loading}
                maxLength={MAX_CHARS}
              />

              {/* Preview da imagem na modal */}
              {imagePreview && (
                <div
                  style={{
                    position: "relative",
                    marginBottom: "1rem",
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <button
                    type="button"
                    onClick={removeImage}
                    style={{
                      position: "absolute",
                      top: "0.75rem",
                      right: "0.75rem",
                      backgroundColor: "rgba(0,0,0,0.6)",
                      color: "white",
                      borderRadius: "9999px",
                      padding: "0.5rem",
                      zIndex: 10,
                      transition: "background-color 0.2s",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.8)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.6)")
                    }
                    aria-label="Remover imagem"
                  >
                    <FaTimes style={{ width: "1rem", height: "1rem" }} />
                  </button>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: "24rem",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}

              {/* Localização na modal */}
              {showLocationInput && (
                <div
                  style={{
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem",
                    backgroundColor: "#f9fafb",
                    borderRadius: "0.5rem",
                  }}
                >
                  <FaMapMarkerAlt style={{ color: "#1DA1F2", flexShrink: 0 }} />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Adicionar localização"
                    style={{
                      flex: 1,
                      backgroundColor: "transparent",
                      border: "none",
                      outline: "none",
                      fontSize: "0.875rem",
                    }}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLocation("");
                      setShowLocationInput(false);
                    }}
                    style={{
                      color: "#6b7280",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <FaTimes style={{ width: "0.75rem", height: "0.75rem" }} />
                  </button>
                </div>
              )}

              {/* Emoji Picker na modal */}
              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  style={{
                    marginBottom: "1rem",
                    padding: "0.5rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    backgroundColor: "white",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => addEmoji(emoji)}
                        style={{
                          fontSize: "1.5rem",
                          padding: "0.25rem",
                          borderRadius: "0.25rem",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#f3f4f6")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                        disabled={loading}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: charCount > MAX_CHARS * 0.9 ? "#ef4444" : "#6b7280",
                  }}
                >
                  {charCount}/{MAX_CHARS}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "1rem",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <div style={{ display: "flex", gap: "1rem" }}>
                  <label
                    style={{
                      cursor: "pointer",
                      color: "#000000",
                      padding: "0.5rem",
                      borderRadius: "9999px",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f3f4f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageChange}
                      disabled={loading}
                    />
                    <FaImage style={{ width: "1.5rem", height: "1.5rem" }} />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    style={{
                      color: "#000000",
                      padding: "0.5rem",
                      borderRadius: "9999px",
                      transition: "all 0.2s",
                      border: "none",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f3f4f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                    disabled={loading}
                  >
                    <FaSmile style={{ width: "1.5rem", height: "1.5rem" }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLocationInput(!showLocationInput)}
                    style={{
                      color: "#000000",
                      padding: "0.5rem",
                      borderRadius: "9999px",
                      transition: "all 0.2s",
                      border: "none",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f3f4f6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                    disabled={loading}
                  >
                    <FaMapMarkerAlt style={{ width: "1.5rem", height: "1.5rem" }} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CreatePost;