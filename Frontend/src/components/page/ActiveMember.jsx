import { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAppSelector } from '../../store/hooks';

const buildAvatarFallback = displayName =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

const normalizeStatus = status => (status ? status.toString().trim().toLowerCase() : '');

const resolveMemberStatus = member => {
  if (!member) return 'offline';
  const normalized = normalizeStatus(member.status);
  if (normalized) return normalized;
  if (typeof member.isActive === 'boolean') return member.isActive ? 'online' : 'offline';
  return 'offline';
};

const isMemberOnline = member => {
  if (member?.isActive === true) return true;
  const status = resolveMemberStatus(member);
  return ['online', 'active', 'active now', 'available'].includes(status);
};

const resolveAvatarSrc = (avatar, displayName) => {
  if (!avatar) return buildAvatarFallback(displayName);
  const cleaned = String(avatar).trim();
  if (!cleaned || cleaned === 'undefined' || cleaned === 'null') {
    return buildAvatarFallback(displayName);
  }
  return cleaned;
};

const ActiveMember = ({ title = 'Active Team', className = '', onClick }) => {
  const { teamMembers, isLoading } = useAppSelector(state => state.projects);
  const { isDarkMode } = useTheme();
  const isInteractive = typeof onClick === 'function';

  const orderedTeamMembers = useMemo(() => {
    const members = Array.isArray(teamMembers) ? [...teamMembers] : [];
    return members.sort((a, b) => {
      const aOnline = isMemberOnline(a) ? 1 : 0;
      const bOnline = isMemberOnline(b) ? 1 : 0;
      if (aOnline !== bOnline) return bOnline - aOnline;
      const aName = (a?.username || a?.email || '').toString().toLowerCase();
      const bName = (b?.username || b?.email || '').toString().toLowerCase();
      return aName.localeCompare(bName);
    });
  }, [teamMembers]);

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={
        isInteractive
          ? event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`rounded-3xl p-10 backdrop-blur-2xl border flex flex-col min-h-0 ${
        isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-[#0B0E11]/15'
      } ${
        isInteractive
          ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17E1FF]/60'
          : ''
      } ${className}`}
    >
      <h3 className="text-2xl font-black mb-8 uppercase tracking-tighter">{title}</h3>
      <div className="space-y-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
        {orderedTeamMembers.length === 0 ? (
          <p className={`text-sm ${isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/70'}`}>
            {isLoading ? 'Loading team members...' : 'No team members found.'}
          </p>
        ) : (
          orderedTeamMembers.map((member, i) => {
            const isOnline = isMemberOnline(member);
            const displayName = member.username || member.email || 'Unknown';
            const avatarSrc = resolveAvatarSrc(member.avatar, displayName);

            return (
              <div key={member._id || member.username || i} className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    onError={event => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = buildAvatarFallback(displayName);
                    }}
                    className={`w-12 h-12 rounded-full object-cover ring-2 ${
                      isOnline
                        ? 'ring-[#17E1FF] shadow-[0_0_12px_rgba(23,225,255,0.35)]'
                        : 'ring-yellow-500/40'
                    }`}
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 ${
                      isDarkMode ? 'border-[#0B0E11]' : 'border-white'
                    } ${isOnline ? 'bg-[#17E1FF]' : 'bg-yellow-500'}`}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{displayName}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isOnline ? 'bg-[#17E1FF]' : 'bg-yellow-500'
                      }`}
                    />
                    <p
                      className={`text-xs ${
                        isDarkMode ? 'text-[#E6E8E5]/50' : 'text-[#0B0E11]/70'
                      }`}
                    >
                      {isOnline ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActiveMember;
