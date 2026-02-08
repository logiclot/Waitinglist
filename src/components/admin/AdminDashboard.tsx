"use client";

import { useState } from "react";
import { getCommissionPercent, getExpertTierLabel } from "@/lib/commission";
import { getYouTubeEmbedUrl } from "@/lib/video";
import { ShieldCheck, Award, Check, ExternalLink, Plus, Pencil, UserX, AlertTriangle, ChevronDown, ChevronUp, MapPin, Briefcase } from "lucide-react";
import { Solution } from "@/types";
import { ListingEditor } from "@/components/admin/ListingEditor";
import { approveSpecialist, suspendSpecialist, verifySpecialist, makeFoundingSpecialist, updateSolutionVideoStatus } from "@/actions/admin";
import { BRAND_NAME } from "@/lib/branding";

interface AdminDashboardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialExperts: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialSolutions: any[];
}

export function AdminDashboard({ initialExperts, initialSolutions }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'experts' | 'solutions'>('experts');
  
  // Expert State
  const [expertList, setExpertList] = useState(initialExperts);
  const [expandedExpertId, setExpandedExpertId] = useState<string | null>(null);
  
  // Solution State
  const [solutionList, setSolutionList] = useState<Solution[]>(initialSolutions);
  const [fullEditingSolution, setFullEditingSolution] = useState<Solution | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  // --- Actions ---
  const handleApprove = async (id: string) => {
    await approveSpecialist(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setExpertList(expertList.map((e: any) => e.id === id ? { ...e, status: "APPROVED" } : e));
    showMessage("Specialist approved.");
  };

  const handleSuspend = async (id: string) => {
    await suspendSpecialist(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setExpertList(expertList.map((e: any) => e.id === id ? { ...e, status: "SUSPENDED" } : e));
    showMessage("Specialist suspended.");
  };

  const toggleVerified = async (id: string, current: boolean) => {
    await verifySpecialist(id, !current);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setExpertList(expertList.map((e: any) => e.id === id ? { ...e, verified: !current } : e));
    showMessage("Verification updated.");
  };

  const makeFounding = async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentFounders = expertList.filter((e: any) => e.founding).length;
    if (currentFounders >= 20) {
      alert("Maximum of 20 Founding Experts reached.");
      return;
    }
    await makeFoundingSpecialist(id, currentFounders + 1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setExpertList(expertList.map((e: any) => e.id === id ? { ...e, founding: true, foundingRank: currentFounders + 1 } : e));
    showMessage("Expert marked as Founding Expert.");
  };

  const handleVideoStatus = async (id: string, status: "approved" | "rejected") => {
    await updateSolutionVideoStatus(id, status);
    setSolutionList(solutionList.map(s => 
      s.id === id ? { 
        ...s, 
        demo_video_status: status,
        demo_video_reviewed_at: status === 'approved' ? new Date().toISOString() : undefined
      } : s
    ));
    showMessage(`Video status updated to ${status}.`);
  };

  const handleSaveListing = (data: Partial<Solution>) => {
    if (fullEditingSolution) {
      setSolutionList(solutionList.map(s => s.id === fullEditingSolution.id ? { ...s, ...data } as Solution : s));
      setFullEditingSolution(null);
      showMessage("Solution updated successfully.");
    } else {
      setIsCreating(false);
      showMessage("New solution created.");
    }
  };

  // --- Categorization ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingExperts = expertList.filter((e: any) => e.status === 'PENDING_REVIEW');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeExperts = expertList.filter((e: any) => e.status !== 'PENDING_REVIEW');

  const pendingSolutions = solutionList.filter(s => s.demo_video_status === 'pending');
  const activeSolutions = solutionList.filter(s => s.demo_video_status !== 'pending');

  if (fullEditingSolution || isCreating) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">{isCreating ? "Create New Listing" : `Edit: ${fullEditingSolution?.title}`}</h1>
          <button 
             onClick={() => { setFullEditingSolution(null); setIsCreating(false); }}
             className="text-muted-foreground hover:text-foreground"
          >
            Back to Dashboard
          </button>
        </div>
        <ListingEditor 
          initialData={fullEditingSolution || {}} 
          onSave={handleSaveListing}
          onCancel={() => { setFullEditingSolution(null); setIsCreating(false); }}
        />
      </div>
    );
  }

  // RE-WRITE renderExpertTable to avoid hydration error properly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderExpertList = (experts: any[], isPending: boolean) => (
    <div className={`overflow-hidden rounded-xl border ${isPending ? "border-yellow-500/20 bg-yellow-500/5" : "border-border bg-card"}`}>
       {isPending && (
         <div className="px-6 py-3 border-b border-yellow-500/20 bg-yellow-500/10 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <h3 className="font-bold text-yellow-500">Pending Approvals ({experts.length})</h3>
         </div>
       )}
       <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
             <thead className={`font-medium text-muted-foreground border-b ${isPending ? "border-yellow-500/20" : "border-border bg-secondary/50"}`}>
                <tr>
                   <th className="px-6 py-4 w-[30%]">Candidate</th>
                   <th className="px-6 py-4 w-[25%]">Expertise</th>
                   <th className="px-6 py-4 w-[15%]">Status</th>
                   {!isPending && <th className="px-6 py-4 w-[10%]">Stats</th>}
                   <th className="px-6 py-4 text-right w-[20%]">Actions</th>
                </tr>
             </thead>
             <tbody className={`divide-y ${isPending ? "divide-yellow-500/20" : "divide-border"}`}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {experts.map((expert: any) => {
                  const expertForHelper = {
                    ...expert,
                    completed_sales_count: expert.completedSalesCount,
                    commission_override_percent: expert.commissionOverridePercent
                  };
                  const commission = getCommissionPercent(expertForHelper);
                  const tier = getExpertTierLabel(expertForHelper);
                  const isOverridden = expert.commissionOverridePercent !== null;
                  const isExpanded = expandedExpertId === expert.id;
                  
                  const isAgency = expert.bio?.includes("Agency Website");

                  return (
                    // We render content as children array to avoid invalid nesting
                    // Note: returning an array of TRs requires keys on each TR.
                    [
                      <tr key={`${expert.id}-main`} className="group border-b border-border/50 last:border-0 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setExpandedExpertId(isExpanded ? null : expert.id)}>
                        <td className="px-6 py-4 align-top">
                          <div className="flex flex-col gap-1">
                            <div className="font-bold text-base flex items-center gap-2">
                               {expert.displayName}
                               {isAgency && <span className="text-[10px] uppercase bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-bold tracking-wider">Agency</span>}
                            </div>
                            <div className="text-xs text-muted-foreground">{expert.legalFullName}</div>
                            {expert.country && (
                               <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <MapPin className="w-3 h-3" /> {expert.country}
                               </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                           <div className="space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                 <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                                 {expert.yearsExperience} Years Exp.
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                 {expert.tools?.slice(0, 3).map((tool: string) => (
                                    <span key={tool} className="text-[10px] px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded border border-white/5">
                                       {tool}
                                    </span>
                                 ))}
                                 {expert.tools?.length > 3 && (
                                    <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground">+{expert.tools.length - 3}</span>
                                 )}
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <div className="flex flex-col gap-1.5">
                            {expert.status === 'PENDING_REVIEW' && (
                               <span className="inline-flex items-center w-fit px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-500 text-xs font-medium border border-yellow-500/20">
                                 Pending Review
                               </span>
                            )}
                            {expert.status === 'APPROVED' && (
                               <span className="inline-flex items-center w-fit px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-xs font-medium border border-green-500/20">
                                 Approved
                               </span>
                            )}
                            {expert.status === 'SUSPENDED' && (
                               <span className="inline-flex items-center w-fit px-2 py-1 rounded-md bg-red-500/10 text-red-500 text-xs font-medium border border-red-500/20">
                                 Suspended
                               </span>
                            )}
                            
                            {expert.verified && (
                              <span className="inline-flex items-center gap-1 text-xs text-blue-400 font-medium">
                                <ShieldCheck className="h-3 w-3" /> Verified
                              </span>
                            )}
                            {expert.founding && (
                              <span className="inline-flex items-center gap-1 text-xs text-yellow-500 font-medium">
                                <Award className="h-3 w-3" /> Founding #{expert.foundingRank}
                              </span>
                            )}
                          </div>
                        </td>
                        {!isPending && (
                           <td className="px-6 py-4 align-top">
                              <div className="space-y-1">
                                 <div className="text-xs font-medium">{tier}</div>
                                 <div className="text-xs text-muted-foreground">{expert.completedSalesCount} sales</div>
                                 <div className="flex items-center gap-1.5 mt-1">
                                    <span className={`text-sm font-bold ${isOverridden ? "text-purple-400" : ""}`}>
                                       {commission}%
                                    </span>
                                    {isOverridden && (
                                       <span className="w-1.5 h-1.5 rounded-full bg-purple-500" title="Override Active" />
                                    )}
                                 </div>
                              </div>
                           </td>
                        )}
                        <td className="px-6 py-4 text-right align-top" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col items-end gap-2">
                             <button 
                              onClick={() => setExpandedExpertId(isExpanded ? null : expert.id)} 
                              className="text-xs text-primary hover:underline font-medium flex items-center gap-1 mb-1"
                            >
                               {isExpanded ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                               {isExpanded ? "Hide Details" : "View Application"}
                            </button>

                            {expert.status === 'PENDING_REVIEW' && (
                              <div className="flex gap-2">
                                <button onClick={() => handleApprove(expert.id)} className="px-4 py-1.5 bg-green-500 text-black font-bold rounded hover:bg-green-400 transition-colors text-xs">Approve</button>
                                <button onClick={() => handleSuspend(expert.id)} className="px-4 py-1.5 bg-card border border-border hover:bg-secondary transition-colors text-xs font-medium">Reject</button>
                              </div>
                            )}
                            
                            {expert.status === 'APPROVED' && (
                               <div className="flex flex-col gap-2 items-end">
                                  <button 
                                    onClick={() => toggleVerified(expert.id, expert.verified)}
                                    className={`text-xs px-3 py-1.5 rounded-md border transition-colors w-24 text-center ${
                                       expert.verified 
                                       ? "border-muted text-muted-foreground" 
                                       : "border-blue-500/30 hover:bg-blue-500/10 text-blue-400"
                                    }`}
                                 >
                                    {expert.verified ? "Unverify" : "Verify"}
                                 </button>
                                 <button onClick={() => handleSuspend(expert.id)} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                                    <UserX className="h-3 w-3" /> Suspend
                                 </button>
                               </div>
                            )}
                            
                            {!expert.founding && expert.status === 'APPROVED' && (
                              <button 
                                onClick={() => makeFounding(expert.id)}
                                className="text-xs px-3 py-1.5 rounded-md border border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-500 transition-colors w-24"
                              >
                                Make Founding
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>,
                      isExpanded && (
                         <tr key={`${expert.id}-details`} className="bg-white/5 border-t border-border/50 cursor-default" onClick={(e) => e.stopPropagation()}>
                            <td colSpan={isPending ? 4 : 5} className="px-6 py-6">
                               <div className="space-y-6 animate-in slide-in-from-top-2 duration-200">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div className="space-y-3">
                                        <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider border-b border-white/10 pb-1">Professional Details</h4>
                                        <div className="space-y-2 text-sm">
                                           <div className="flex justify-between"><span className="text-muted-foreground">Legal Name:</span> <span>{expert.legalFullName}</span></div>
                                           <div className="flex justify-between"><span className="text-muted-foreground">Location:</span> <span>{expert.country}</span></div>
                                           <div className="flex justify-between"><span className="text-muted-foreground">Experience:</span> <span>{expert.yearsExperience}</span></div>
                                           <div className="flex justify-between"><span className="text-muted-foreground">Tools:</span> <span>{expert.tools?.join(", ") || "None"}</span></div>
                                        </div>
                                     </div>
                                     <div className="space-y-3">
                                        <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider border-b border-white/10 pb-1">Agency & Contact (Private)</h4>
                                        <div className="text-xs bg-black/40 p-3 rounded text-muted-foreground whitespace-pre-wrap font-mono border border-white/5">
                                           {expert.bio || "No private bio/contact data."}
                                        </div>
                                     </div>
                                  </div>
                                  <div className="space-y-3">
                                     <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider border-b border-white/10 pb-1">Value Card / Case Studies</h4>
                                     <div className="text-sm bg-black/40 p-4 rounded text-foreground whitespace-pre-wrap font-mono border border-white/5 leading-relaxed">
                                        {expert.pastImplementations}
                                     </div>
                                  </div>
                                  <div className="space-y-3">
                                     <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider border-b border-white/10 pb-1">Portfolio Links</h4>
                                     <div className="flex flex-col gap-2">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {(Array.isArray(expert.portfolioLinks) ? expert.portfolioLinks : []).map((link: string, i: number) => (
                                           <a key={i} href={link} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline flex items-center gap-1">
                                              <ExternalLink className="w-3 h-3" /> {link}
                                           </a>
                                        ))}
                                     </div>
                                  </div>
                               </div>
                            </td>
                         </tr>
                      )
                    ]
                  );
                })}
             </tbody>
          </table>
       </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{BRAND_NAME} Admin</h1>
        <div className="text-sm text-muted-foreground">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          Founding Experts: <span className="font-bold text-foreground">{expertList.filter((e: any) => e.founding).length}</span> / 20
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('experts')}
          className={`px-4 py-2 border-b-2 transition-colors font-medium ${
            activeTab === 'experts' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Experts ({expertList.length})
        </button>
        <button
          onClick={() => setActiveTab('solutions')}
          className={`px-4 py-2 border-b-2 transition-colors font-medium ${
            activeTab === 'solutions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Solutions ({solutionList.length})
        </button>
      </div>

      {message && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-2 rounded-md mb-6 flex items-center gap-2 animate-in fade-in">
          <Check className="h-4 w-4" /> {message}
        </div>
      )}

      {activeTab === 'experts' ? (
        <div className="space-y-8">
           {pendingExperts.length > 0 && renderExpertList(pendingExperts, true)}
           {renderExpertList(activeExperts, false)}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-end">
             <button 
               onClick={() => setIsCreating(true)}
               className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
             >
               <Plus className="h-4 w-4" /> Create New Solution
             </button>
          </div>

          {/* Pending Video Reviews */}
          {pendingSolutions.length > 0 && (
             <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 text-yellow-500 font-bold">
                   <AlertTriangle className="w-5 h-5" />
                   <h2>Pending Video Reviews ({pendingSolutions.length})</h2>
                </div>
                <div className="space-y-4">
                   {pendingSolutions.map(solution => (
                      <div key={solution.id} className="bg-background border border-border rounded-lg p-4">
                         <div className="flex justify-between items-start gap-4">
                            <div>
                               <h3 className="font-bold">{solution.title}</h3>
                               {/* @ts-expect-error: expert relation */}
                               <p className="text-xs text-muted-foreground">Expert: {solution.expert?.displayName}</p>
                               {solution.demo_video_url && (
                                  <a href={solution.demo_video_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-1">
                                     <ExternalLink className="w-3 h-3" /> {solution.demo_video_url}
                                  </a>
                               )}
                            </div>
                            <div className="w-64 bg-black rounded aspect-video overflow-hidden">
                               {solution.demo_video_id ? (
                                  <iframe 
                                    src={getYouTubeEmbedUrl(solution.demo_video_id, solution.demo_video_start_seconds)}
                                    className="w-full h-full"
                                    title="Preview"
                                  />
                               ) : (
                                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No Preview</div>
                               )}
                            </div>
                         </div>
                         <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => handleVideoStatus(solution.id, 'approved')} className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded text-xs font-bold">Approve Video</button>
                            <button onClick={() => handleVideoStatus(solution.id, 'rejected')} className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-xs font-bold">Reject Video</button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* Active Solutions List */}
          <div className="space-y-4">
             <h2 className="font-bold text-lg">All Solutions</h2>
             {activeSolutions.map((solution) => (
                <div key={solution.id} className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row gap-6">
                   <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                         <h3 className="font-bold text-lg">{solution.title}</h3>
                         <span className="text-xs bg-secondary px-2 py-1 rounded-full text-muted-foreground">{solution.category}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{solution.short_summary}</p>
                      <button onClick={() => setFullEditingSolution(solution)} className="text-xs text-primary hover:underline font-medium flex items-center gap-1"><Pencil className="w-3 h-3"/> Edit</button>
                   </div>
                   <div className="text-right">
                      {solution.demo_video_status === 'approved' && <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">Video Approved</span>}
                      {solution.demo_video_status === 'rejected' && <span className="text-xs text-red-500 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">Video Rejected</span>}
                      {!solution.demo_video_url && <span className="text-xs text-muted-foreground">No Video</span>}
                   </div>
                </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
