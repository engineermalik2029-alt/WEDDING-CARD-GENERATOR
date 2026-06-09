import fs from 'node:fs/promises';
import path from 'node:path';

const dataDirectory = path.resolve(process.cwd(), 'data');
const dataFile = path.join(dataDirectory, 'invitations.json');

async function readInvitations() {
  try {
    const raw = await fs.readFile(dataFile, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeInvitations(invitations) {
  await fs.mkdir(dataDirectory, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(invitations, null, 2));
}

export async function saveInvitationLocally(invitation) {
  const invitations = await readInvitations();
  const document = {
    ...invitation,
    createdAt: new Date().toISOString()
  };
  invitations.push(document);
  await writeInvitations(invitations);
  return document;
}

export async function findInvitationLocally(shortId) {
  const invitations = await readInvitations();
  return invitations.find((invitation) => invitation.shortId === shortId) || null;
}