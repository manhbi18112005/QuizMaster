"use client";

import {
  Pencil,
  SquareArrowOutUpRight
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Expandable,
  ExpandableCard,
  ExpandableCardContent,
  ExpandableCardFooter,
  ExpandableCardHeader,
  ExpandableContent,
  ExpandableTrigger,
} from "@/components/cultui/expandable"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircledIcon, TrashIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DbQuestionBank, getAllQuestionBanks, saveQuestionBank, deleteQuestionBank } from "@/lib/db";
import { WelcomeTour } from "@/components/welcome-tour";

export default function Home() {
  const [questionBanks, setQuestionBanks] = useState<DbQuestionBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBankId, setNewBankId] = useState("");
  const [newBankName, setNewBankName] = useState("");
  const [newBankDescription, setNewBankDescription] = useState("");
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [bankToDeleteId, setBankToDeleteId] = useState<string | null>(null);

  // State for Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [bankToEdit, setBankToEdit] = useState<DbQuestionBank | null>(null);
  const [editBankName, setEditBankName] = useState("");
  const [editBankDescription, setEditBankDescription] = useState("");

  const router = useRouter();

  useEffect(() => {
    async function loadQuestionBanks() {
      setIsLoading(true);
      try {
        const banks = await getAllQuestionBanks();
        setQuestionBanks(banks);
      } catch (error) {
        console.error("Failed to load question banks:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadQuestionBanks();
  }, []);

  const openCreateModal = () => {
    setNewBankId(""); // Reset ID field
    setNewBankName("");
    setNewBankDescription("");
    setIsCreateModalOpen(true);
  };

  const handleConfirmCreateBank = async () => {
    if (!newBankName.trim()) {
      alert("Bank name cannot be empty.");
      return;
    }
    // Basic validation for ID if provided (e.g., not just whitespace)
    // More complex validation (e.g., uniqueness) would ideally be handled by the DB layer or backend
    const idToSave = newBankId.trim() !== "" ? newBankId.trim() : undefined;

    try {
      await saveQuestionBank({
        id: idToSave, // Pass the ID if provided
        name: newBankName,
        description: newBankDescription,
        questions: [],
      });
      const updatedBanks = await getAllQuestionBanks();
      setQuestionBanks(updatedBanks);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create new bank:", error);
    }
  };

  const openEditModal = (bank: DbQuestionBank) => {
    setBankToEdit(bank);
    setEditBankName(bank.name);
    setEditBankDescription(bank.description || "");
    setIsEditModalOpen(true);
  };

  const handleConfirmEditBank = async () => {
    if (!bankToEdit) return;

    if (!editBankName.trim()) {
      alert("Bank name cannot be empty.");
      return;
    }

    try {
      await saveQuestionBank({
        ...bankToEdit,
        name: editBankName,
        description: editBankDescription,
      });
      const updatedBanks = await getAllQuestionBanks();
      setQuestionBanks(updatedBanks);
      setIsEditModalOpen(false);
      setBankToEdit(null);
    } catch (error) {
      console.error("Failed to update bank:", error);
    }
  };

  const confirmDeleteBank = async () => {
    if (bankToDeleteId) {
      try {
        await deleteQuestionBank(bankToDeleteId);
        const updatedBanks = await getAllQuestionBanks();
        setQuestionBanks(updatedBanks);
      } catch (error) {
        console.error("Failed to delete question bank:", error);
      } finally {
        setIsDeleteAlertOpen(false);
        setBankToDeleteId(null);
      }
    }
  };

  const openDeleteAlert = (bankId: string) => {
    setBankToDeleteId(bankId);
    setIsDeleteAlertOpen(true);
  };

  const handleViewBank = (bankId: string) => {
    router.push(`/${bankId}`);
  };

  if (isLoading) {
    return (
      <ContentLayout title="Student Revision Quizzes">
        <p>Loading question banks...</p>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Student Revision Quizzes">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold hidden sm:block">Your Question Banks</h2>
        <Button onClick={openCreateModal}>
          <PlusCircledIcon className="mr-2 h-4 w-4" /> Create New Bank
        </Button>
      </div>

      {questionBanks.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center mt-10">
          <Card className="w-full max-w-md p-6">
            <CardHeader>
              <CardTitle className="text-2xl">No Question Banks Yet!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                It looks like you have not created any question banks. Get started by creating your first one.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={openCreateModal} size="lg">
                <PlusCircledIcon className="mr-2 h-5 w-5" /> Create Your First Bank
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {questionBanks.map((bank) => (
            <Expandable
              key={bank.id}
              expandDirection="both"
              expandBehavior="replace"
              initialDelay={0.2}
            >
              {({ isExpanded }) => (
                <ExpandableTrigger>
                  <ExpandableCard
                    className="w-full relative"
                    collapsedSize={{ width: 320, height: 240 }}
                    expandedSize={{ width: 420, height: 480 }}
                    hoverToExpand={false}
                    expandDelay={200}
                    collapseDelay={500}
                  >
                    <ExpandableCardHeader>
                      <div className="flex justify-between items-start w-full">
                        <div>
                          <Badge
                            variant="secondary"
                            className="bg-primary/20 text-primary mb-2"
                          >
                            {bank.questions?.length} Questions
                          </Badge>
                          <h3 className="font-semibold text-xl">{bank.name}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="outline" className="h-8 w-8" onClick={(event) => { event.stopPropagation(); openEditModal(bank); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Bank</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </ExpandableCardHeader>

                    <ExpandableCardContent>
                      <div className="flex flex-col items-start justify-between mb-4">
                        <div className="flex items-center text-sm text-primary-foreground">
                          {bank.id}
                        </div>
                      </div>
                      <ExpandableContent preset="blur-md" stagger staggerChildren={0.2}>
                        <p className="text-sm text-primary-foreground mb-4">
                          {bank.description || "No description provided."}
                        </p>
                        <div className="space-y-2">
                          {isExpanded && (
                            <Button onClick={(event) => { event.stopPropagation(); handleViewBank(bank.id); }} variant="outline" className="w-full">
                              <SquareArrowOutUpRight className="h-4 w-4 mr-2" />
                              Open Bank
                            </Button>
                          )}
                          <Button onClick={(event) => { event.stopPropagation(); openDeleteAlert(bank.id); }} className="w-full bg-red-600 hover:bg-red-700 text-white">
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </ExpandableContent>
                    </ExpandableCardContent>
                    <ExpandableContent preset="slide-up">
                      <ExpandableCardFooter>
                        <div className="flex items-center justify-between w-full text-sm text-gray-600 dark:text-gray-300">
                          <span>Last Updated</span>
                          <span>{bank.updatedAt.toLocaleString()}</span>
                        </div>
                      </ExpandableCardFooter>
                    </ExpandableContent>
                  </ExpandableCard>
                </ExpandableTrigger>
              )}
            </Expandable>
          ))}
        </div>
      )}

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Question Bank</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new question bank. Click create when you are done.
              You can optionally provide an ID, or one will be generated.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id" className="text-right">ID</Label>
              <Input
                id="id"
                value={newBankId}
                onChange={(e) => setNewBankId(e.target.value)}
                className="col-span-3"
                placeholder="e.g., custom-bank-id (or leave blank)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newBankName}
                onChange={(e) => setNewBankName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Algebra Basics"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={newBankDescription}
                onChange={(e) => setNewBankDescription(e.target.value)}
                className="col-span-3"
                placeholder="e.g., A collection of fundamental algebra questions."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmCreateBank}>Create Bank</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bank Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => {
        setIsEditModalOpen(isOpen);
        if (!isOpen) setBankToEdit(null);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Question Bank</DialogTitle>
            <DialogDescription>
              Update the details for this question bank. Click save when you are done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editBankName}
                onChange={(e) => setEditBankName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Algebra Basics"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Input
                id="edit-description"
                value={editBankDescription}
                onChange={(e) => setEditBankDescription(e.target.value)}
                className="col-span-3"
                placeholder="e.g., A collection of fundamental algebra questions."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditModalOpen(false); setBankToEdit(null); }}>Cancel</Button>
            <Button onClick={handleConfirmEditBank}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              question bank and all its associated questions (if any linking is implemented).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBankToDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction className={buttonVariants({ variant: "destructive" })} onClick={confirmDeleteBank}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <WelcomeTour />
    </ContentLayout>
  );
}
