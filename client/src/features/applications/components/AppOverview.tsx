import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  useCreateApplicationMutation,
  useGetApplicationDetailsQuery,
  useUpdateApplicationMutation,
} from "../store/applicationsApiSlice";
import { Controller, useForm } from "react-hook-form";
import type {
  ApplicationCreate,
  ApplicationOut,
  ApplicationUpdate,
} from "../types";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { selectAuth } from "@/features/auth/store/authSlice";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/utils/handleApiError";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AppStatusOptions,
  STATUS_COLOR_MAP_BG,
  STATUS_COLOR_MAP_FG,
} from "@/utils/globalValues";
import { Separator } from "@/components/ui/separator";
import { daysBetweenDateAndToday } from "@/utils/helpers";

const applicationDefaultValues: ApplicationOut = {
  id: "",

  name: "",
  description: null,
  environment: null,
  region: null,
  owner_name: null,
  vendor_company: null,
  infra_host: null,
  app_tech: null,

  priority: undefined,
  app_priority: 0,
  vertical: null,

  is_active: false,
  is_completed: false,

  owner_id: null,
  ticket_id: null,
  status: undefined,

  created_at: null,
  updated_at: null,
  started_at: null,
  completed_at: null,
  due_date: null,

  imitra_ticket_id: null,
  titan_spoc: null,
  app_url: null,

  user_type: null,
  data_type: null,
};

const AppOverview: React.FC<{ onNewAppSuccess?: () => void }> = ({
  onNewAppSuccess,
}) => {
  const { appId } = useParams();

  const { data: appDetails } = useGetApplicationDetailsQuery(appId as string, {
    skip: !appId,
  });
  const [updateAppMutation, { isLoading: isUpdating, error: editAppErr }] =
    useUpdateApplicationMutation();
  const [addAppMutation, { isLoading: isAdding, error: newAppErr }] =
    useCreateApplicationMutation();

  const { control, reset, handleSubmit, watch } = useForm<ApplicationOut>({
    defaultValues: applicationDefaultValues,
  });

  const currentUserInfo = useSelector(selectAuth);

  const [isEditing, setIsEditing] = useState(false);
  const isAdmin = ["admin", "manager"].includes(currentUserInfo.role);
  const isNew = !appId && isAdmin;
  const startedAt = watch("started_at");

  useEffect(() => {
    reset(appDetails?.data || {});
  }, [appDetails, reset]);

  const handleSaveEdit = async (payload: ApplicationUpdate) => {
    try {
      toast.promise(
        (async () => {
          if (!appDetails?.data) {
            toast.error("Application Id not found");
            return;
          }
          await updateAppMutation({
            appId: appDetails?.data.id,
            payload,
          }).unwrap();
          setIsEditing(false);
        })(),
        {
          loading: "Saving Changes...",
          success: "Changes saved successfully!",
          error: getApiErrorMessage(editAppErr) ?? "Failed to save changes",
        },
      );
    } catch (err) {
      const errMSg = getApiErrorMessage(err);
      toast.error(errMSg ?? "Failed to save changes");
    }
  };

  const handleNewApp = async (payload: ApplicationCreate) => {
    try {
      toast.promise(
        (async () => {
          await addAppMutation(payload);
        })(),
        {
          loading: "Creating new app...",
          success: `App ${payload.name} created successfully!`,
          error: getApiErrorMessage(newAppErr) ?? "Failed to create new app",
        },
      );
      onNewAppSuccess?.();
    } catch (err) {
      const errMSg = getApiErrorMessage(err);
      toast.error(errMSg ?? "Failed to save changes");
    }
  };

  const onSubmit = async (data: ApplicationCreate) => {
    if (isEditing) {
      await handleSaveEdit(data);
    } else if (isAdmin && (isEditing || isNew)) {
      await handleNewApp(data);
    } else {
      return;
    }
  };

  return (
    <form
      id="application-details"
      className="flex flex-col min-h-0 h-full w-full"
      onSubmit={handleSubmit(onSubmit)}
    >
      <FieldGroup className="h-full min-h-0">
        <div className="flex flex-col h-full min-h-0 gap-2">
          <ScrollArea className="flex-1 min-h-0">
            <div className="pr-3 space-y-4 pb-5">
              {/* App Name */}
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor="app-name">Name</FieldLabel>
                    <Input
                      {...field}
                      required
                      readOnly={!(isNew || isEditing)}
                      id="app-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Application name"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {/* Description */}
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor="app-description">
                      Description
                    </FieldLabel>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      readOnly={!(isNew || isEditing)}
                      id="app-description"
                      aria-invalid={fieldState.invalid}
                      placeholder="Describe application in brief"
                      autoComplete="off"
                      className="max-h-36"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {/* app url */}
              <Controller
                name="app_url"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="gap-2">
                    <FieldLabel htmlFor="app-url">Application URL</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      readOnly={!(isNew || isEditing)}
                      id="app-url"
                      aria-invalid={fieldState.invalid}
                      placeholder="URL of the application"
                      autoComplete="off"
                      className="max-h-36"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* App status */}
                <Controller
                  name="status"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor="app-status">Status</FieldLabel>
                      <Select
                        disabled={!(isEditing || isNew)}
                        value={
                          field.value != null ? String(field.value) : undefined
                        }
                        onValueChange={(value) => field.onChange(value)}
                      >
                        <SelectTrigger
                          id="app-status"
                          className="disabled:border disabled:font-medium disabled:text-card-foreground disabled:opacity-100 disabled:cursor-auto"
                          style={{
                            backgroundColor: field.value
                              ? STATUS_COLOR_MAP_BG[field.value]
                              : undefined,
                            color: field.value
                              ? STATUS_COLOR_MAP_FG[field.value]
                              : undefined,
                          }}
                        >
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent className="">
                          {AppStatusOptions.map((s, idx) => {
                            return (
                              <>
                                <SelectItem
                                  value={s.value}
                                  style={{
                                    color: STATUS_COLOR_MAP_FG[s.value],
                                  }}
                                  className=""
                                >
                                  {s.label}
                                </SelectItem>
                                {idx !== AppStatusOptions.length && (
                                  <Separator />
                                )}
                              </>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* App priority */}
                <Controller
                  name="app_priority"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor="app-priority">Priority</FieldLabel>
                      <Select
                        disabled={!(isEditing || isNew)}
                        value={
                          field.value != null ? String(field.value) : undefined
                        }
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <SelectTrigger
                          id="app-priority"
                          className="disabled:border disabled:font-medium disabled:text-card-foreground disabled:opacity-100 disabled:cursor-auto"
                        >
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Low</SelectItem>
                          <Separator />

                          <SelectItem value="2">Medium</SelectItem>
                          <Separator />

                          <SelectItem value="3">High</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                {/* Owner Name */}
                <Controller
                  name="owner_name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor="owner-name">Owner</FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        readOnly={!(isNew || isEditing)}
                        id="owner-name"
                        aria-invalid={fieldState.invalid}
                        placeholder="Owner of application"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                {/* Vendor */}
                <Controller
                  name="vendor_company"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor="vendor-company">Vendor</FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        readOnly={!(isNew || isEditing)}
                        id="vendor-company"
                        aria-invalid={fieldState.invalid}
                        placeholder="Vendor company"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                {/* Vertical */}
                <Controller
                  name="vertical"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor="vertical">Vertical</FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        readOnly={!(isNew || isEditing)}
                        id="vertical"
                        aria-invalid={fieldState.invalid}
                        placeholder="Vertical"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Titan SPOC */}
                <Controller
                  name="titan_spoc"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor="titan_spoc">Titan SPOC</FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        readOnly={!(isNew || isEditing)}
                        id="titan_spoc"
                        aria-invalid={fieldState.invalid}
                        placeholder="Titan SPOC"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Titan SPOC */}
                <Controller
                  name="imitra_ticket_id"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor="imitra_ticket_id">
                        iMitra Ticket
                      </FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        readOnly={!(isNew || isEditing)}
                        id="imitra_ticket_id"
                        aria-invalid={fieldState.invalid}
                        placeholder="IMitra Ticket ID"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Started On */}
                <Controller
                  name="started_at"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor="started_at">Start Date</FieldLabel>
                      <Input
                        {...field}
                        value={field.value ? field.value.split("T")[0] : ""}
                        type="date"
                        id="started_at"
                        readOnly={!(isNew || isEditing)}
                        aria-invalid={fieldState.invalid}
                        placeholder="Application Technology"
                        autoComplete="off"
                      />
                      {startedAt && (
                        <p className="text-xs text-muted-foreground">
                          {daysBetweenDateAndToday(startedAt)} days since start
                        </p>
                      )}
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Ended On */}
                {appDetails?.data && (
                  <Controller
                    name="completed_at"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="gap-2"
                      >
                        <FieldLabel htmlFor="completed_at">End Date</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          type="date"
                          id="completed_at"
                          readOnly={!(isNew || isEditing)}
                          aria-invalid={fieldState.invalid}
                          placeholder="Application Technology"
                          autoComplete="off"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                )}

                {/* Environment */}
                <Controller
                  name="environment"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor="environment">Environment</FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        readOnly={!(isNew || isEditing)}
                        id="environment"
                        aria-invalid={fieldState.invalid}
                        placeholder="Environment"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                {/* Region */}
                <Controller
                  name="region"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor="region">Region</FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        readOnly={!(isNew || isEditing)}
                        id="region"
                        aria-invalid={fieldState.invalid}
                        placeholder="Region"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                {/* App Tech */}
                <Controller
                  name="app_tech"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor="app_tech">Technology</FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        readOnly={!(isNew || isEditing)}
                        id="app_tech"
                        aria-invalid={fieldState.invalid}
                        placeholder="Application Technology"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* User Type */}
                <Controller
                  name="user_type"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor="user_type">User Type</FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        readOnly={!(isNew || isEditing)}
                        id="user_type"
                        aria-invalid={fieldState.invalid}
                        placeholder=""
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Data Type */}
                <Controller
                  name="data_type"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor="data_type">Data Type</FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        readOnly={!(isNew || isEditing)}
                        id="data_type"
                        aria-invalid={fieldState.invalid}
                        placeholder=""
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Infra Host */}
                {/* <Controller
                  name="infra_host"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-2">
                      <FieldLabel htmlFor="infra_host">Infra Host</FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        readOnly={!(isNew || isEditing)}
                        id="infra_host"
                        aria-invalid={fieldState.invalid}
                        placeholder="Infra Host"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                /> */}
              </div>
            </div>
          </ScrollArea>
          {["admin", "manager"].includes(currentUserInfo.role) && (
            <div className="rounded-md bg-accent py-2 mx-1">
              <div className="flex items-center gap-3 justify-between">
                {!isNew && (
                  <div
                    className="group inline-flex items-center gap-2"
                    data-state={isEditing ? "checked" : "unchecked"}
                  >
                    {isEditing && (
                      <span
                        id={`edit-app-yes`}
                        className="group-data-[state=checked]:text-muted-foreground/70 cursor-pointer text-right text-sm font-medium"
                        aria-controls="edit-app"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </span>
                    )}
                    <Switch
                      id="edit-app"
                      checked={isEditing}
                      onCheckedChange={setIsEditing}
                      aria-labelledby={`edit-app-yes edit-app-no`}
                      className="focus-visible:border-ring-green-600 dark:focus-visible:border-ring-green-400 focus-visible:ring-green-400/20 data-[state=checked]:bg-green-400 dark:focus-visible:ring-green-300/40 dark:data-[state=checked]:bg-green-300 hover:cursor-pointer"
                    />
                    <span
                      id={`edit-app-no`}
                      className="group-data-[state=unchecked]:text-muted-foreground/70 cursor-pointer text-left text-sm font-medium"
                      aria-controls="edit-app"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </span>
                  </div>
                )}
                {(isEditing || isNew) && (
                  <Field orientation={"horizontal"}>
                    <Button
                      size="sm"
                      form="application-details"
                      type="submit"
                      disabled={isUpdating || isAdding}
                    >
                      Save
                    </Button>
                  </Field>
                )}
              </div>
            </div>
          )}
        </div>
      </FieldGroup>
    </form>
  );
};

export default AppOverview;
