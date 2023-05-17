import React from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core'
import "../../../../src/customStyles/preview.css"
import { getFileType } from '../../../utils/helpers'

const PreviewDialog = (props) => {
  const { title, open, src, setOpen } = props
  const isBlob = src?.startsWith('blob')
  const type = getFileType(src)

  return (
    <Dialog
      fullWidth={true}
      maxWidth="lg"
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="confirm-dialog">
      <DialogTitle id="confirm-dialog">{title}</DialogTitle>
      <DialogContent className={(isBlob || type === 'video' || type === 'file') ? "preview-container" : ""}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {(!isBlob && type === 'video') ?
            <video className="preview-video" controls>
              <source src={src}/>
            </video>
          : <embed
              className={(isBlob || type === 'file') ? "preview-file" : ""}
              style={{ width: type === 'file' && '100vh', height: type === 'file' && '70vh' }}
              src={src}
              height={(isBlob || type === 'file') ? "100%" : "65%"}
              width={(isBlob || type === 'file') ? "100%" : "65%"}
            />}
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={() => {
            setOpen(false)
          }}
          color="default"
        >
          Ok!
        </Button>
      </DialogActions>
    </Dialog>
  )
}
export default PreviewDialog
