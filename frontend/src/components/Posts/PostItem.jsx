import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHeart, 
  FaRegHeart, 
  FaComment, 
  FaRetweet, 
  FaShare, 
  FaEllipsisH,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import { postsAPI, commentsAPI } from '../../services/api';

const PostItem = ({ post, onDelete, onUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingRetweet, setLoadingRetweet] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const { user } = useAuth();

  const handleLike = async () => {
    if (loadingLike) return;
    setLoadingLike(true);
    try {
      await postsAPI.likePost(post.id);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao curtir:', error);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleRetweet = async () => {
    if (loadingRetweet) return;
    setLoadingRetweet(true);
    try {
      await postsAPI.retweetPost(post.id);
      alert('Post retweetado com sucesso!');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao retweetar:', error);
      alert('Erro ao retweetar. Tente novamente.');
    } finally {
      setLoadingRetweet(false);
    }
  };

  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    alert('Link copiado para a área de transferência!');
    setShowShareOptions(false);
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent(post.content);
    const url = encodeURIComponent(`${window.location.origin}/post/${post.id}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    setShowShareOptions(false);
  };

  const loadComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const response = await commentsAPI.getComments(post.id);
        setComments(response.data);
      } catch (error) {
        console.error('Erro ao carregar comentários:', error);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    
    try {
      await commentsAPI.createComment(post.id, { content: commentContent });
      setCommentContent('');
      const response = await commentsAPI.getComments(post.id);
      setComments(response.data);
      // Atualizar contador de comentários
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao comentar:', error);
    }
  };

  const handleDelete = async () => {
    setShowMenu(false);
    if (window.confirm('Tem certeza que deseja excluir esta postagem?')) {
      try {
        await postsAPI.deletePost(post.id);
        if (onDelete) onDelete(post.id);
      } catch (error) {
        console.error('Erro ao excluir:', error);
      }
    }
  };

  return (
    <div className="post-card border-b border-gray-200 last:border-b-0 p-4 hover:bg-gray-50 transition-colors">
      <div className="flex space-x-3">
        {/* Avatar */}
        <Link to={`/profile/${post.user.username}`}>
          <img
            src={post.user.profile_picture || '/default-avatar.png'}
            alt={post.user.username}
            className="w-12 h-12 rounded-full hover:opacity-90 transition-opacity"
          />
        </Link>

        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <Link to={`/profile/${post.user.username}`} className="font-bold text-gray-900 hover:underline">
                {post.user.username}
              </Link>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 text-sm">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </span>
            </div>
            
            {user?.id === post.user.id && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <FaEllipsisH />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={handleDelete}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Localização */}
          {post.location && (
            <div className="flex items-center space-x-1 text-gray-500 text-sm mb-2">
              <FaMapMarkerAlt className="text-twitter-blue" size={12} />
              <span>{post.location}</span>
            </div>
          )}

          {/* Content */}
          <p className="text-gray-900 mb-3 whitespace-pre-wrap">{post.content}</p>
          
          {/* Image */}
          {post.image && (
            <div className="mb-3 rounded-2xl overflow-hidden border border-gray-200">
              <img
                src={post.image}
                alt="Post"
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between max-w-md mt-4">
            {/* Comentários */}
            <button
              onClick={loadComments}
              className="flex items-center space-x-2 text-gray-500 hover:text-twitter-blue group"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-50">
                <FaComment className="h-5 w-5" />
              </div>
              <span className="text-sm">{post.comments_count || 0}</span>
            </button>

            {/* Retweet */}
            <button
              onClick={handleRetweet}
              disabled={loadingRetweet}
              className="flex items-center space-x-2 text-gray-500 hover:text-green-500 group"
            >
              <div className="p-2 rounded-full group-hover:bg-green-50">
                <FaRetweet className="h-5 w-5" />
              </div>
              <span className="text-sm">{post.retweets_count || 0}</span>
            </button>

            {/* Like */}
            <button
              onClick={handleLike}
              disabled={loadingLike}
              className={`flex items-center space-x-2 group ${post.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
              <div className={`p-2 rounded-full ${post.is_liked ? 'bg-red-50' : 'group-hover:bg-red-50'}`}>
                {post.is_liked ? (
                  <FaHeart className="h-5 w-5" />
                ) : (
                  <FaRegHeart className="h-5 w-5" />
                )}
              </div>
              <span className="text-sm">{post.likes_count || 0}</span>
            </button>

            {/* Compartilhar */}
            <div className="relative">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-500 hover:text-twitter-blue group"
              >
                <div className="p-2 rounded-full group-hover:bg-blue-50">
                  <FaShare className="h-5 w-5" />
                </div>
              </button>
              
              {showShareOptions && (
                <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20 min-w-[200px]">
                  <button
                    onClick={copyToClipboard}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    📋 Copiar link
                  </button>
                  <button
                    onClick={shareViaTwitter}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    𝕏 Compartilhar no Twitter
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <form onSubmit={handleComment} className="flex space-x-3 mb-4">
                <img
                  src={user?.profile_picture || '/default-avatar.png'}
                  alt={user?.username}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Tweet sua resposta"
                    className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-twitter-blue"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!commentContent.trim()}
                  className="bg-twitter-blue hover:bg-twitter-darkBlue text-white font-bold px-4 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Responder
                </button>
              </form>

              {loadingComments ? (
                <div className="text-center text-gray-500 py-4">Carregando comentários...</div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3 mb-4 last:mb-0">
                    <img
                      src={comment.user.profile_picture || '/default-avatar.png'}
                      alt={comment.user.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-bold text-sm">{comment.user.username}</span>
                        <span className="text-gray-500 text-sm">
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                      </div>
                      <p className="text-gray-900 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">Nenhum comentário ainda.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostItem;